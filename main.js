import random
from typing import List

class NumberCompressor:
    def __init__(self):
        self.chars = [chr(i) for i in range(33, 127)]
        self.base = len(self.chars)
        
    def _encode_base93(self, num: int) -> str:
        if num == 0:
            return self.chars[0]
        result = ""
        while num:
            num, remainder = divmod(num, self.base)
            result = self.chars[remainder] + result
        return result

    def _decode_base93(self, encoded: str) -> int:
        result = 0
        for char in encoded:
            result = result * self.base + self.chars.index(char)
        return result

    def _encode_range(self, numbers: List[int]) -> str:
        return f"{self._encode_base93(numbers[0])}-{self._encode_base93(numbers[-1])}"

    def _decode_range(self, encoded: str) -> List[int]:
        start, end = encoded.split('-')
        return list(range(self._decode_base93(start), self._decode_base93(end) + 1))

    def serialize(self, numbers: List[int]) -> str:
        if not numbers:
            return ""
        numbers = sorted(set(numbers))
        result = []
        i = 0
        while i < len(numbers):
            range_start = i
            while (i + 1 < len(numbers) and 
                   numbers[i + 1] == numbers[i] + 1):
                i += 1
            if i - range_start >= 2:
                result.append('r' + self._encode_range(numbers[range_start:i + 1]))
            else:
                while range_start <= i:
                    result.append('n' + self._encode_base93(numbers[range_start]))
                    range_start += 1
            i += 1
        return ','.join(result)

    def deserialize(self, encoded: str) -> List[int]:
        if not encoded:
            return []
        result = []
        for item in encoded.split(','):
            if item[0] == 'r':
                result.extend(self._decode_range(item[1:]))
            else:
                result.append(self._decode_base93(item[1:]))
        return result

def generate_test_case(size: int, min_val: int = 1, max_val: int = 300) -> List[int]:
    return random.sample(range(min_val, max_val + 1), min(size, max_val - min_val + 1))

def run_test(numbers: List[int], case_name: str) -> tuple:
    compressor = NumberCompressor()
    encoded = compressor.serialize(numbers)
    decoded = compressor.deserialize(encoded)
    assert sorted(set(numbers)) == sorted(decoded), f"Test failed: {case_name}"
    original_size = len(','.join(str(x) for x in numbers))
    compressed_size = len(encoded)
    compression_ratio = (original_size - compressed_size) / original_size * 100
    return encoded, compression_ratio

test_cases = {
    "Простой короткий": [1, 2, 3, 10, 15],
    "50 случайных чисел": generate_test_case(50),
    "100 случайных чисел": generate_test_case(100),
    "500 случайных чисел": generate_test_case(500),
    "1000 случайных чисел": generate_test_case(1000),
    "Однозначные числа": list(range(1, 10)),
    "Двузначные числа": list(range(10, 100)),
    "Трехзначные числа": list(range(100, 301)),
    "По три каждого числа": [num for num in range(1, 301) for _ in range(3)]
}

for case_name, numbers in test_cases.items():
    encoded, compression_ratio = run_test(numbers, case_name)
    print(f"\nТест: {case_name}")
    print(f"Исходный размер: {len(','.join(str(x) for x in numbers))} байт")
    print(f"Сжатый размер: {len(encoded)} байт")
    print(f"Коэффициент сжатия: {compression_ratio:.2f}%")
    if len(numbers) <= 10:
        print(f"Исходные числа: {numbers}")
        print(f"Сжатая строка: {encoded}")
