import sqlite3


def add_tags(namesong, nameartist, tags):
    conn = sqlite3.connect("db/tags_database.db")
    c = conn.cursor()
    for i in range(len(tags) - 1, 3):
        tags.append("")
    c.execute("INSERT INTO all_tags VALUES (?, ?, ?, ?, ?, ?)",
              (namesong, nameartist, tags[0], tags[1], tags[2], tags[3]))
    conn.commit()
    conn.close()


def get_tags(namesong, nameartist):
    conn = sqlite3.connect("db/tags_database.db")
    c = conn.cursor()
    c.execute("SELECT * FROM all_tags WHERE namesong = ? AND nameartist = ?", (namesong, nameartist))
    result = c.fetchall()
    conn.close()
    return result

def get_all():
    conn = sqlite3.connect("db/tags_database.db")
    c = conn.cursor()
    c.execute("SELECT * FROM all_tags")
    result = c.fetchall()
    conn.close()
    return result