function Debug(action: () => unknown) {
    if (process.env.NODE_ENV !== "production")
        action();
}

export default Debug;