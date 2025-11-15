import sys
import sqlite3
import time
import ipaddress
from scapy.all import PcapReader, IP, TCP, UDP


#flows = {
#('192.168.10.111', '104.18.32.47', 36340, 443, 'TCP'): {
#    "start": 1762865342.705939,
#    "end": 1762865348.681514,
#    "packets": 32,
#    "bytes": 4500
#}
flows = {}

#設定
lan_net = ipaddress.ip_network("192.168.3.0/24")
idle_timeout = 300

#DB接続
conn = sqlite3.connect("flow.db")
cur = conn.cursor()


def main():

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

            elif UDP in pkt:
                l4 = pkt[UDP]
                protocol = "UDP"

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
                "time=", timestamp
            )

            key = (src_ip, dst_ip, src_port, dst_port, protocol)
            update_flow(key, timestamp, length)

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
            f"pkts={f['packets']} bytes={f['bytes']} duration={duration:.3f}"
        )
        save_db((src_ip, dst_ip, src_port, dst_port, protocol), f)


        

def update_flow(key, timestamp, length):

    #タプルを分解
    src_ip, dst_ip, src_port, dst_port, protocol = key

    if key not in flows:#新規作成

        flows[key] = {  #valueを保存すると同時にkeyも保存される
            "direction": get_direction(src_ip, dst_ip),
            "start_time": timestamp,
            "end_time": timestamp,
            "packets": 1,
            "bytes": length,
        }

    else:   #フロー更新
        f = flows[key]

        #valueの中に更にkey:valueがあるイメージ
        if timestamp < f["start_time"]:
            f["start_time"] = timestamp
        
        if timestamp > f["end_time"]:
            f["end_time"] = timestamp
        
        f["packets"] += 1

        f["bytes"] += length


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
        direction, start_time, end_time, packets, bytes)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        src_ip,
        dst_ip,
        src_port,
        dst_port,
        protocol,
        f["direction"],
        f["start_time"],
        f["end_time"],
        f["packets"],
        f["bytes"]
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


#ファイルを直接実行したときにmainを実行
if __name__ == "__main__":
    main()

