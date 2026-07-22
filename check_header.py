import struct

with open("ai_models/roberta/model.safetensors", "rb") as f:
    header_len_bytes = f.read(8)
    header_len = struct.unpack("<Q", header_len_bytes)[0]
    print("Declared header length:", header_len)
    
    header_json = f.read(header_len)
    print("Header bytes actually read:", len(header_json))
    
    # try to parse it
    import json
    try:
        data = json.loads(header_json)
        print("Header parsed OK, keys:", list(data.keys())[:5])
    except Exception as e:
        print("Header JSON parse failed:", e)