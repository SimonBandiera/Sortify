import sqlite3

conn = sqlite3.connect('../Server/db/tags_database.db')
c = conn.cursor()
c.execute("""CREATE TABLE IF NOT EXISTS all_tags(namesong TEXT,nameartist TEXT, tag1 TEXT, tag2 TEXT, tags3 TEXT, tags4 TEXT)""")
conn.commit()
conn.close()
