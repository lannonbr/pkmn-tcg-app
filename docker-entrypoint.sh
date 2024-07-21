#!/bin/ash

sqlite3 data/data.db < schemas/entries.sql

npm run dev