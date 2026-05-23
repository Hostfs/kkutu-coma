import sys

def main():
    copy_count = 0
    in_copy = False
    with open('db.sql', 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('COPY kkutu_ko ('):
                in_copy = True
                print("Found COPY kkutu_ko!")
                continue
            if in_copy:
                if line.strip() == '\\.':
                    in_copy = False
                    print("End of COPY kkutu_ko!")
                    break
                copy_count += 1
                
    print(f"Total words in db.sql COPY kkutu_ko: {copy_count}")

if __name__ == '__main__':
    main()
