package database

import (
	"errors"

	"modernc.org/sqlite"
	sqlite3 "modernc.org/sqlite/lib"
)

// IsUniqueViolation reports whether err comes from a UNIQUE or PRIMARY KEY
// constraint failure.
func IsUniqueViolation(err error) bool {
	var serr *sqlite.Error
	if !errors.As(err, &serr) {
		return false
	}
	return serr.Code() == sqlite3.SQLITE_CONSTRAINT_UNIQUE ||
		serr.Code() == sqlite3.SQLITE_CONSTRAINT_PRIMARYKEY
}
