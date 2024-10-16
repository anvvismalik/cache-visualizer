let algorithm = 'LRU'; // Default algorithm
let cache; // Cache object

// Create LRU Cache
function createLRUCache(capacity) {
  let cache = new Map(); // LRU uses Map to track order of usage

  function put(key, value) {
    if (cache.has(key)) {
      cache.delete(key); // Remove to update the order
    } else if (cache.size === capacity) {
      const leastRecentlyUsedKey = cache.keys().next().value;
      cache.delete(leastRecentlyUsedKey); // Evict the least recently used
      updateDisplay('evicted', leastRecentlyUsedKey);
    }
    cache.set(key, value);
    updateDisplay('added', key);
  }

  function get(key) {
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value); // Update order to mark as most recently used
      updateDisplay('accessed', key);
      updateStatus(`Accessed key: ${key}, value: ${value}`);
    } else {
      updateStatus(`Error: Key "${key}" not found in the cache`);
    }
  }

  return { put, get, getCache: () => cache };
}

// Create FIFO Cache
function createFIFOCache(capacity) {
  let cache = [];

  function put(key, value) {
    if (cache.find(entry => entry.key === key)) {
      cache = cache.filter(entry => entry.key !== key); // Remove to update
    } else if (cache.length === capacity) {
      const evicted = cache.shift(); // FIFO evicts the first inserted
      updateDisplay('evicted', evicted.key);
    }
    cache.push({ key, value });
    updateDisplay('added', key);
  }

  function get(key) {
    const item = cache.find(entry => entry.key === key);
    if (item) {
      updateDisplay('accessed', key);
      updateStatus(`Accessed key: ${key}, value: ${item.value}`);
    } else {
      updateStatus(`Error: Key "${key}" not found in the cache`);
    }
  }

  return { put, get, getCache: () => cache };
}

// Create LFU Cache
function createLFUCache(capacity) {
  let cache = new Map();
  let frequencies = new Map();

  function put(key, value) {
    if (cache.has(key)) {
      cache.set(key, value);
      frequencies.set(key, frequencies.get(key) + 1);
    } else {
      if (cache.size === capacity) {
        let leastFrequent = Math.min(...frequencies.values());
        let keyToEvict = [...cache.keys()].find(key => frequencies.get(key) === leastFrequent);
        cache.delete(keyToEvict);
        frequencies.delete(keyToEvict);
        updateDisplay('evicted', keyToEvict);
      }
      cache.set(key, value);
      frequencies.set(key, 1);
    }
    updateDisplay('added', key);
  }

  function get(key) {
    if (cache.has(key)) {
      frequencies.set(key, frequencies.get(key) + 1);
      updateDisplay('accessed', key);
      updateStatus(`Accessed key: ${key}, value: ${cache.get(key)}`);
    } else {
      updateStatus(`Error: Key "${key}" not found in the cache`);
    }
  }

  return { put, get, getCache: () => cache };
}

// Function to update the algorithm
function setAlgorithm(newAlgorithm) {
  algorithm = newAlgorithm;
  const cacheSize = parseInt(document.getElementById('cache-size').value) || 3;
  switch (algorithm) {
    case 'LRU':
      cache = createLRUCache(cacheSize);
      break;
    case 'FIFO':
      cache = createFIFOCache(cacheSize);
      break;
    case 'LFU':
      cache = createLFUCache(cacheSize);
      break;
  }
  updateStatus(`Algorithm set to ${newAlgorithm}`);
  updateDisplay();
}

// Function to set the cache size
function setCacheSize() {
  const newSize = parseInt(document.getElementById('cache-size').value);
  if (newSize > 0) {
    setAlgorithm(algorithm);
    updateStatus(`Cache size set to ${newSize}`);
  } else {
    updateStatus('Cache size must be greater than 0');
  }
}

// Function to add key-value pair to the cache
function addToCache() {
  const key = document.getElementById('input-key').value.trim();
  const value = document.getElementById('input-value').value.trim();

  if (key && value) {
    cache.put(key, value);
    updateStatus(`Added key: ${key}, value: ${value}`);
    clearInputs(); // Clear input fields after adding to cache
  } else {
    updateStatus('Please enter both key and value');
  }
}

// Function to access an item in the cache
function accessFromCache() {
  const key = document.getElementById('input-key').value.trim();

  if (key) {
    cache.get(key);
  } else {
    updateStatus('Please enter a key to access');
  }
}

// Function to clear input fields after action
function clearInputs() {
  document.getElementById('input-key').value = '';
  document.getElementById('input-value').value = '';
}

// Function to update the display
function updateDisplay(action = '', affectedKey = '') {
  const cacheDisplay = document.getElementById('cache-display');
  cacheDisplay.innerHTML = ''; // Clear the display
  const cacheContent = cache.getCache();

  if (algorithm === 'FIFO') {
    cacheContent.forEach(entry => {
      const cacheItem = document.createElement('li');
      cacheItem.textContent = `${entry.key}: ${entry.value}`;
      if (entry.key === affectedKey) {
        cacheItem.classList.add(action);
        setTimeout(() => cacheItem.classList.remove(action), 1500);
      }
      cacheDisplay.appendChild(cacheItem);
    });
  } else {
    for (let [key, value] of cacheContent) {
      const cacheItem = document.createElement('li');
      cacheItem.textContent = `${key}: ${value}`;
      if (key === affectedKey) {
        cacheItem.classList.add(action);
        setTimeout(() => cacheItem.classList.remove(action), 1500);
      }
      cacheDisplay.appendChild(cacheItem);
    }
  }
}

// Function to update status text
function updateStatus(message) {
  const statusText = document.getElementById('status-text');
  statusText.textContent = message;
}

// Initialize with default LRU cache
cache = createLRUCache(3);
