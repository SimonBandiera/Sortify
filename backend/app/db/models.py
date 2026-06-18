from sqlalchemy import Column, String, Text
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class TagCache(Base):
    __tablename__ = "all_tags"

    namesong = Column(String, primary_key=True)
    nameartist = Column(String, primary_key=True)
    tag1 = Column(Text, default="")
    tag2 = Column(Text, default="")
    tag3 = Column(Text, default="")
    tag4 = Column(Text, default="")
