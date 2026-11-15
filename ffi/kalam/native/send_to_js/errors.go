package send_to_js

type MtpDetectFailedError struct {
	error
}

type MtpChangedError struct {
	error
}

// Errors of kalam's own phone -> Mac copy (download.go). go-mtpx's error
// types can't be built outside it, so these carry the same meaning and are
// reported to the app with the same error types.

// the phone couldn't list or read an object (like mtpx.FileObjectError)
type FileObjectReadError struct {
	Err error
}

func (e FileObjectReadError) Error() string { return e.Err.Error() }

// a file or folder couldn't be written on the Mac
type LocalFileWriteError struct {
	Err        error
	Permission bool
}

func (e LocalFileWriteError) Error() string { return e.Err.Error() }
