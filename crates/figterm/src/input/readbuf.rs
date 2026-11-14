/// This is a simple, small, read buffer that always has the buffer
/// contents available as a contiguous slice.
#[derive(Debug)]
pub struct ReadBuffer {
    storage: Vec<u8>,
}

impl Default for ReadBuffer {
    fn default() -> Self {
        Self::new()
    }
}

impl ReadBuffer {
    pub fn new() -> Self {
        Self {
            storage: Vec::with_capacity(16),
        }
    }

    pub fn as_slice(&self) -> &[u8] {
        self.storage.as_slice()
    }

    pub fn is_empty(&self) -> bool {
        self.storage.is_empty()
    }

    pub fn len(&self) -> usize {
        self.storage.len()
    }

    /// Mark `len` bytes as consumed, discarding them and shunting
    /// the contents of the buffer such that the remainder of the
    /// bytes are available at the front of the buffer.
    pub fn advance(&mut self, len: usize) {
        let remain = self.storage.len() - len;
        self.storage.rotate_left(len);
        self.storage.truncate(remain);
    }

    /// Append the contents of the slice to the read buffer
    pub fn extend_with(&mut self, slice: &[u8]) {
        self.storage.extend_from_slice(slice);
    }

    /// Search for `needle` starting at `offset`.  Returns its offset
    /// into the buffer if found, else None.
    pub fn find_subsequence(&self, offset: usize, needle: &[u8]) -> Option<usize> {
        let haystack = &self.storage[offset..];
        memchr::memmem::find(haystack, needle).map(|x| x + offset)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn buffer(bytes: &[u8]) -> ReadBuffer {
        let mut buf = ReadBuffer::default();
        buf.extend_with(bytes);
        buf
    }

    // The input parser uses this to find the end of a bracketed paste.
    #[test]
    fn finds_the_end_of_a_bracketed_paste() {
        let buf = buffer(b"\x1b[200~hello\x1b[201~rest");
        assert_eq!(buf.find_subsequence(6, b"\x1b[201~"), Some(11));
    }

    #[test]
    fn reports_offsets_relative_to_the_whole_buffer() {
        let buf = buffer(b"ab--cd--ef");
        assert_eq!(buf.find_subsequence(0, b"--"), Some(2));
        assert_eq!(buf.find_subsequence(3, b"--"), Some(6));
        assert_eq!(buf.find_subsequence(7, b"--"), None);
    }

    #[test]
    fn finds_nothing_when_the_needle_is_absent_or_cut_off() {
        let buf = buffer(b"\x1b[200~hello\x1b[201");
        assert_eq!(buf.find_subsequence(0, b"\x1b[201~"), None);
        assert_eq!(buf.find_subsequence(buf_len(&buf), b"x"), None);
    }

    fn buf_len(buf: &ReadBuffer) -> usize {
        buf.storage.len()
    }
}
