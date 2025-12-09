import sys
import sqlite3
import time
import ipaddress
import threading
from scapy.all import PcapReader, IP, TCP, UDP


#flows = {
#('192.168.10.111', '104.18.32.47', 36340, 443, 'TCP'): {
#    "start": 1762865342.705939,
#    "end": 1762865348.681514,
#    "packets": 32,
#    "bytes": 4500
#}
flows = {}

#各務原wifi
#lan_net = ipaddress.ip_network("192.168.10.0/24")

#153教室lan
lan_net = ipaddress.ip_network("10.128.56.0/22")
idle_timeout = 3

#DB接続
conn = sqlite3.connect("flow.db")
cur = conn.cursor()

# 5秒ごとのパケット集計用のテーブルを作成
cur.execute("""
    CREATE TABLE IF NOT EXISTS realtime_packets (
        timestamp INTEGER PRIMARY KEY,
        total_bytes INTEGER NOT NULL,
        total_packets INTEGER NOT NULL
    )
""")
conn.commit()

# 5秒ごとのパケット集計用の辞書
realtime_aggregates = {}
# {
#   timestamp_5sec: {
#       "total_bytes": 0,
#       "total_packets": 0
#   }
# }


def main():

    # 5秒ごとにリアルタイム集計データを保存するスレッドを開始
    save_thread = threading.Thread(target=periodic_save_realtime, daemon=True)
    save_thread.start()

    #sys.stdin.buffer=tcpdumpから流れてくるpcap形式のバイナリを読み込む
    #scapyのPcapReader()という関数にそれを渡すと1パケットずつ読み取ってくれる
    #水道管に口を当てた状態(for文でごくごく飲み込む)
    reader = PcapReader(sys.stdin.buffer)

    try:
        for pkt in reader:
            
            if IP in pkt:
                ip = pkt[IP]
                src_ip = ip.src
                dst_ip = ip.dst

            else:
                continue

            if TCP in pkt:
                l4 = pkt[TCP]
                protocol = "TCP"
                flags = l4.flags

            elif UDP in pkt:
                l4 = pkt[UDP]
                protocol = "UDP"
                flags = ""

            else:
                continue

            
            src_port = int(l4.sport)    #送信元ポート番号
            dst_port = int(l4.dport)    #宛先ポート番号

            length = len(pkt)   #bytes
            timestamp = float(pkt.time)    #time

            print(
                src_ip, ":", src_port, "->",
                dst_ip, ":", dst_port,
                protocol,
                "len=", length,
                "time=", timestamp,
                "flags=", flags
            )

            key = (src_ip, dst_ip, src_port, dst_port, protocol)
            update_flow(key, timestamp, length, flags)
            # リアルタイム集計は現在時刻を使用（パケットのタイムスタンプではなく）
            update_realtime_aggregate(time.time(), length)

            now = time.time()
            cleanup(now)

    except KeyboardInterrupt:
        #ctrlCが押されたときここに来る
        #下のフロー出力はctrlC後(tcpdump + flow.py終了後)必ず実行される
        pass

    print("---------------------------------------------------------------------------------------")
    print("-----------------------------------------------------------------------------------------")
    print("-----------------------------------------------------------------------------------------")
    #.item()はkey-value形式で取り出す
    #keyはそれぞれ改名し, valueはfに入れる
    for (src_ip, dst_ip, src_port, dst_port, protocol), f in flows.items():
        duration = f["end_time"] - f["start_time"]
        print(
            f"{src_ip}:{src_port} -> {dst_ip}:{dst_port} {protocol} "
            f"bytes={f['bytes']} pkts={f['packets']} duration={duration:.3f}"
        )
        save_db((src_ip, dst_ip, src_port, dst_port, protocol), f)


        

def update_flow(key, timestamp, length, flags):

    #タプルを分解
    src_ip, dst_ip, src_port, dst_port, protocol = key

    if key not in flows:#新規作成

        flows[key] = {  #valueを保存すると同時にkeyも保存される
            "direction": get_direction(src_ip, dst_ip),
            "start_time": timestamp,
            "end_time": timestamp,
            "bytes": length,
            "packets": 1,
            "ack_count": 0,
            "syn_count": 0,
            "fin_count": 0,
            "rst_count": 0
        }

    else:   #フロー更新
        f = flows[key]

        #valueの中に更にkey:valueがあるイメージ
        if timestamp < f["start_time"]:
            f["start_time"] = timestamp
        
        if timestamp > f["end_time"]:
            f["end_time"] = timestamp

        f["bytes"] += length
        
        f["packets"] += 1

        if "A" in flags:
            f["ack_count"] += 1

        if "S" in flags:
            f["syn_count"] += 1

        if "F" in flags:
            f["fin_count"] += 1

        if "R" in flags:
            f["rst_count"] += 1


def get_direction(src_ip, dst_ip):

    # true/falseが入る
    src_internal = ipaddress.ip_address(src_ip) in lan_net
    dst_internal = ipaddress.ip_address(dst_ip) in lan_net

    # notは真偽値をひっくり返す
    if src_internal and not dst_internal:   #if true and falseと同義
        return "out"
    
    elif not src_internal and dst_internal:
        return "in"
        
    elif src_internal and dst_internal:
        return "internal"
    
    else:
        return "external"



def save_db(key, f):

    #src_ip = key[0]
    #src_port = key[1] ...
    (src_ip, dst_ip, src_port, dst_port, protocol) = key

    #?はプレースホルダ
    cur.execute("""
        INSERT INTO flows
        (src_ip, dst_ip, src_port, dst_port, protocol, 
        direction, start_time, end_time, bytes, packets,
        ack_count, syn_count, fin_count, rst_count)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        src_ip,
        dst_ip,
        src_port,
        dst_port,
        protocol,
        f["direction"],
        f["start_time"],
        f["end_time"],
        f["bytes"],
        f["packets"],
        f["ack_count"],
        f["syn_count"],
        f["fin_count"],
        f["rst_count"]
    ))

    #execute(ready) -> commit(go)
    conn.commit()
    print("フローをflow.dbに追加")


def cleanup(now):

    expired_keys = []

    #今生きてる全フローをチェック
    for key, f in flows.items():

        if now - f["end_time"] > idle_timeout:
            save_db(key, f)
            expired_keys.append(key)

    #flows辞書から削除
    for key in expired_keys:
        del flows[key]


def update_realtime_aggregate(timestamp, length):
    """5秒ごとのパケット集計を更新"""
    # 5秒間隔のタイムスタンプを計算（5秒単位に切り捨て）
    timestamp_5sec = int(timestamp // 5) * 5
    
    if timestamp_5sec not in realtime_aggregates:
        realtime_aggregates[timestamp_5sec] = {
            "total_bytes": 0,
            "total_packets": 0
        }
    
    realtime_aggregates[timestamp_5sec]["total_bytes"] += length
    realtime_aggregates[timestamp_5sec]["total_packets"] += 1


def save_realtime_aggregates():
    """5秒ごとの集計データをDBに保存"""
    current_time = time.time()
    current_timestamp_5sec = int(current_time // 5) * 5
    
    # デバッグ: 辞書の状態を確認
    if len(realtime_aggregates) > 0:
        print(f"realtime_aggregates辞書の状態: {len(realtime_aggregates)}件のデータがあります")
        for ts, data in list(realtime_aggregates.items())[:3]:  # 最初の3件を表示
            print(f"  timestamp={ts}, bytes={data['total_bytes']}, packets={data['total_packets']}")
    
    # realtime_aggregates辞書内のすべてのデータを保存
    # タイムスタンプの範囲を広げて、過去のデータも保存できるようにする
    saved_count = 0
    for timestamp_5sec, data in realtime_aggregates.items():
        # タイムスタンプの差を計算（絶対値で比較）
        time_diff = abs(current_timestamp_5sec - timestamp_5sec)
        # 60秒以内のデータを保存（より広い範囲）
        if time_diff <= 60:
            try:
                cur.execute("""
                    INSERT OR REPLACE INTO realtime_packets
                    (timestamp, total_bytes, total_packets)
                    VALUES(?, ?, ?)
                """, (
                    timestamp_5sec,
                    data["total_bytes"],
                    data["total_packets"]
                ))
                saved_count += 1
                print(f"データを保存: timestamp={timestamp_5sec}, bytes={data['total_bytes']}, packets={data['total_packets']}")
            except Exception as e:
                print(f"データ保存エラー (timestamp={timestamp_5sec}): {e}")
                import traceback
                traceback.print_exc()
    
    if saved_count > 0:
        conn.commit()
        print(f"リアルタイム集計データ {saved_count} 件を保存しました")
    else:
        if len(realtime_aggregates) > 0:
            print(f"警告: realtime_aggregatesに{len(realtime_aggregates)}件のデータがありますが、保存されませんでした")
            print(f"現在時刻の5秒間隔: {current_timestamp_5sec}")
    
    # 60秒以上古いデータを削除（メモリ節約）
    expired_keys = []
    for timestamp_5sec in realtime_aggregates.keys():
        if abs(current_timestamp_5sec - timestamp_5sec) > 60:
            expired_keys.append(timestamp_5sec)
    
    for key in expired_keys:
        del realtime_aggregates[key]


def periodic_save_realtime():
    """5秒ごとにリアルタイム集計データを保存するスレッド"""
    print("リアルタイム集計スレッドを開始しました")
    while True:
        time.sleep(5)  # 5秒待機
        try:
            save_realtime_aggregates()
        except Exception as e:
            print(f"リアルタイム集計保存エラー: {e}")
            import traceback
            traceback.print_exc()


#ファイルを直接実行したときにmainを実行
if __name__ == "__main__":
    main()

