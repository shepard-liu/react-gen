const getIdGenerator = () => {
    let current = 0;
    return {
        nextId() {
            if (current === Number.MAX_SAFE_INTEGER) {
                throw new Error('ID used up.');
            }
            return current++;
        }
    }
}
export default getIdGenerator;