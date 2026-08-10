import time

class InMemoryLockManager:
    def __init__(self):
        self._locks = {}

    def set(self, key, value, nx=False, ex=None):
        current_time = time.time()
        
        # Clean up expired locks
        self._cleanup(current_time)

        if nx and key in self._locks:
            return False

        expire_at = current_time + ex if ex else None
        self._locks[key] = {"value": value, "expire_at": expire_at}
        return True

    def delete(self, key):
        if key in self._locks:
            del self._locks[key]

    def _cleanup(self, current_time):
        keys_to_delete = [k for k, v in self._locks.items() if v["expire_at"] and v["expire_at"] < current_time]
        for k in keys_to_delete:
            del self._locks[k]

# Global lock manager instance
redis_client = InMemoryLockManager()
