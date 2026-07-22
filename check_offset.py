import json
import struct

with open("ai_models/roberta/model.safetensors", "rb") as f:
    header_len_bytes = f.read(8)
    header_len = struct.unpack("<Q", header_len_bytes)[0]
    header_json = f.read(header_len)
    metadata = json.loads(header_json)

    # find the max end-offset any tensor claims
    max_end = 0
    for key, val in metadata.items():
        if key == "__metadata__":
            continue
        offsets = val.get("data_offsets")
        if offsets:
            max_end = max(max_end, offsets[1])

    # actual data section size = total file size - 8 - header_len
    import os
    total_size = os.path.getsize("ai_models/roberta/model.safetensors")
    data_section_size = total_size - 8 - header_len

    print("Total file size:", total_size)
    print("Header length:", header_len)
    print("Data section size (actual):", data_section_size)
    print("Max tensor end-offset (declared):", max_end)
    print("Match?", data_section_size == max_end)