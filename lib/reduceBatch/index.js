const reduceBatch = (array, cb, initialValue, batchSize = 100) => {
    let accumulator = initialValue;

    return new Promise((resolve) => {
        let index = 0;

        const batch = () => {
            for (let i = index; i < (index + batchSize) && i < array.length; i++) {
                accumulator = cb(
                    accumulator,
                    array[i],
                    i,
                    array
                );
            }

            index += batchSize;
            if (index < array.length) {
                setTimeout(() => {
                    batch();
                });
            } else {
                return resolve(accumulator);
            }
        };

        batch();
    });
};

export default reduceBatch;
