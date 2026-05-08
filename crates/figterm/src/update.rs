use fig_os_shim::Context;

pub fn check_for_update(_context: &Context) {
    // Auto-update removed
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_for_update_noop() {
        check_for_update(&Context::new());
    }
}
