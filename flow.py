import sys
import os
import signal
import sqlite3
import time
import ipaddress
import threading
import atexit
from scapy.all import PcapReader, IP, TCP, UDP

# PIDファイルのパス
PID_FILE = "/tmp/flow.pid"

def create_pid_file():
    """PIDファイルを作成"""
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))
    print(f"[PID] Created PID file: {PID_FILE} (PID: {os.getpid()})")

def remove_pid_file():
    """PIDファイルを削除"""
    try:
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
            print(f"[PID] Removed PID file: {PID_FILE}")
    except Exception as e:
        print(f"[PID] Failed to remove PID file: {e}")

def signal_handler(signum, frame):
    """シグナルハンドラ（Ctrl+Cなど）"""
    print(f"\n[SIGNAL] Received signal {signum}, shutting down...")
    remove_pid_file()
    sys.exit(0)


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
#lan_net = ipaddress.ip_network("10.128.56.0/22")

#171教室lan
#lan_net = ipaddress.ip_network("10.128.64.0/22")

#15A教室wifi
lan_net = ipaddress.ip_network("127.0.0.0/8")


idle_timeout = 180

#DB接続
conn = sqlite3.connect("flow.db", timeout=30)  # 30秒のタイムアウト
cur = conn.cursor()
cur.execute("PRAGMA journal_mode=WAL")  # WALモードで同時アクセス改善

# 5秒ごとのパケット集計用のテーブルを作成（送信/受信を分けて保存）
cur.execute("""
    CREATE TABLE IF NOT EXISTS realtime_packets (
        timestamp INTEGER PRIMARY KEY,
        total_bytes INTEGER NOT NULL,
        total_packets INTEGER NOT NULL,
        in_bytes INTEGER DEFAULT 0,
        out_bytes INTEGER DEFAULT 0,
        internal_bytes INTEGER DEFAULT 0,
        external_bytes INTEGER DEFAULT 0,
        in_packets INTEGER DEFAULT 0,
        out_packets INTEGER DEFAULT 0,
        internal_packets INTEGER DEFAULT 0,
        external_packets INTEGER DEFAULT 0,
        tcp_bytes INTEGER DEFAULT 0,
        udp_bytes INTEGER DEFAULT 0,
        tcp_packets INTEGER DEFAULT 0,
        udp_packets INTEGER DEFAULT 0
    )
""")
conn.commit()

# 既存テーブルに新カラムがない場合は追加
try:
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN internal_bytes INTEGER DEFAULT 0")
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN external_bytes INTEGER DEFAULT 0")
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN internal_packets INTEGER DEFAULT 0")
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN external_packets INTEGER DEFAULT 0")
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN tcp_bytes INTEGER DEFAULT 0")
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN udp_bytes INTEGER DEFAULT 0")
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN tcp_packets INTEGER DEFAULT 0")
    cur.execute("ALTER TABLE realtime_packets ADD COLUMN udp_packets INTEGER DEFAULT 0")
    conn.commit()
except:
    pass  # カラムが既に存在する場合は無視

# 5秒ごとのパケット集計用の辞書
realtime_aggregates = {}
# {
#   timestamp_5sec: {
#       "total_bytes": 0,
#       "total_packets": 0,
#       "in_bytes": 0, "out_bytes": 0, "internal_bytes": 0, "external_bytes": 0,
#       "in_packets": 0, "out_packets": 0, "internal_packets": 0, "external_packets": 0,
#       "tcp_bytes": 0, "udp_bytes": 0, "tcp_packets": 0, "udp_packets": 0
#   }
# }


def main():
    # PIDファイルを作成
    create_pid_file()
    
    # 終了時にPIDファイルを削除するように登録
    atexit.register(remove_pid_file)
    
    # シグナルハンドラを設定（Ctrl+C対応）
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

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
            direction = get_direction(src_ip, dst_ip)
            update_flow(key, timestamp, length, flags)
            # リアルタイム集計は現在時刻を使用（パケットのタイムスタンプではなく）
            update_realtime_aggregate(time.time(), length, direction, protocol)

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


def update_realtime_aggregate(timestamp, length, direction, protocol):
    """5秒ごとのパケット集計を更新（送信/受信別・プロトコル別）"""
    # 5秒間隔のタイムスタンプを計算（5秒単位に切り捨て）
    timestamp_5sec = int(timestamp // 5) * 5
    
    if timestamp_5sec not in realtime_aggregates:
        realtime_aggregates[timestamp_5sec] = {
            "total_bytes": 0,
            "total_packets": 0,
            "in_bytes": 0,
            "out_bytes": 0,
            "internal_bytes": 0,
            "external_bytes": 0,
            "in_packets": 0,
            "out_packets": 0,
            "internal_packets": 0,
            "external_packets": 0,
            "tcp_bytes": 0,
            "udp_bytes": 0,
            "tcp_packets": 0,
            "udp_packets": 0
        }
    
    agg = realtime_aggregates[timestamp_5sec]
    agg["total_bytes"] += length
    agg["total_packets"] += 1
    
    # 方向別に集計
    if direction == "in":
        agg["in_bytes"] += length
        agg["in_packets"] += 1
    elif direction == "out":
        agg["out_bytes"] += length
        agg["out_packets"] += 1
    elif direction == "internal":
        agg["internal_bytes"] += length
        agg["internal_packets"] += 1
    elif direction == "external":
        agg["external_bytes"] += length
        agg["external_packets"] += 1
    
    # プロトコル別に集計
    if protocol == "TCP":
        agg["tcp_bytes"] += length
        agg["tcp_packets"] += 1
    elif protocol == "UDP":
        agg["udp_bytes"] += length
        agg["udp_packets"] += 1


def save_realtime_aggregates():
    """5秒ごとの集計データをDBに保存（別スレッド用に専用DB接続を使用）"""
    # スレッドセーフにするため、この関数内で専用のDB接続を作成
    thread_conn = sqlite3.connect("flow.db", timeout=30)  # 30秒のタイムアウト
    thread_cur = thread_conn.cursor()
    
    current_time = time.time()
    current_timestamp_5sec = int(current_time // 5) * 5
    
    # デバッグ: 辞書の状態を確認
    if len(realtime_aggregates) > 0:
        print(f"realtime_aggregates辞書の状態: {len(realtime_aggregates)}件のデータがあります")
        for ts, data in list(realtime_aggregates.items())[:3]:  # 最初の3件を表示
            print(f"  timestamp={ts}, bytes={data['total_bytes']}, packets={data['total_packets']}")
    
    # realtime_aggregates辞書のコピーを作成（スレッドセーフ）
    aggregates_copy = dict(realtime_aggregates)
    
    # realtime_aggregates辞書内のすべてのデータを保存
    saved_count = 0
    for timestamp_5sec, data in aggregates_copy.items():
        # タイムスタンプの差を計算（絶対値で比較）
        time_diff = abs(current_timestamp_5sec - timestamp_5sec)
        # 60秒以内のデータを保存（より広い範囲）
        if time_diff <= 60:
            try:
                thread_cur.execute("""
                    INSERT OR REPLACE INTO realtime_packets
                    (timestamp, total_bytes, total_packets, 
                     in_bytes, out_bytes, internal_bytes, external_bytes,
                     in_packets, out_packets, internal_packets, external_packets,
                     tcp_bytes, udp_bytes, tcp_packets, udp_packets)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    timestamp_5sec,
                    data["total_bytes"],
                    data["total_packets"],
                    data.get("in_bytes", 0),
                    data.get("out_bytes", 0),
                    data.get("internal_bytes", 0),
                    data.get("external_bytes", 0),
                    data.get("in_packets", 0),
                    data.get("out_packets", 0),
                    data.get("internal_packets", 0),
                    data.get("external_packets", 0),
                    data.get("tcp_bytes", 0),
                    data.get("udp_bytes", 0),
                    data.get("tcp_packets", 0),
                    data.get("udp_packets", 0)
                ))
                saved_count += 1
                print(f"データを保存: timestamp={timestamp_5sec}, total={data['total_bytes']}B, TCP={data.get('tcp_bytes', 0)}B, UDP={data.get('udp_bytes', 0)}B")
            except Exception as e:
                print(f"データ保存エラー (timestamp={timestamp_5sec}): {e}")
                import traceback
                traceback.print_exc()
    
    if saved_count > 0:
        thread_conn.commit()
        print(f"リアルタイム集計データ {saved_count} 件を保存しました")
    else:
        if len(aggregates_copy) > 0:
            print(f"警告: realtime_aggregatesに{len(aggregates_copy)}件のデータがありますが、保存されませんでした")
            print(f"現在時刻の5秒間隔: {current_timestamp_5sec}")
    
    # DB接続を閉じる
    thread_conn.close()
    
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

