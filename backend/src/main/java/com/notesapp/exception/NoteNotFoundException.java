package com.notesapp.exception;

public class NoteNotFoundException extends RuntimeException {
    public NoteNotFoundException(Long id) {
        super("Note " + id + " not found");
    }
}
