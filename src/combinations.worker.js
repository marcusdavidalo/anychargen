/* eslint-env worker */
self.onmessage = ({ data: { inputArray, length } }) => {
  if (typeof length !== "number") {
    console.error("Invalid length:", length);
    return;
  }

  const blockSize = 10000;
  let block = [];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generate = async (prefix, remainingLength) => {
    if (remainingLength === 0) {
      block.push(prefix);

      // If the block is full, post it back to the main thread and start a new block
      if (block.length >= blockSize) {
        self.postMessage(block);
        block = [];
        await delay(1000); // Yield to the event loop
      }

      return;
    }

    for (let i = 0; i < inputArray.length; i++) {
      await generate(prefix + inputArray[i], remainingLength - 1);
    }
  };

  (async () => {
    await generate("", length);

    // Post any remaining combinations in the last block
    if (block.length > 0) {
      self.postMessage(block);
    }
  })();
};
