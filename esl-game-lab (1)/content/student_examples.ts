
export const STATIC_STUDENT_EXAMPLES = [
  "I love this song! (음악에 맞춰 신나게 춤을 추며)",
  "Freeze! (음악이 멈추자마자 동작을 멈추고 정지 상태를 유지함)",
  "It's an apple! (플래시카드를 확인하고 손가락으로 가리키며 크게 외침)",
  "I didn't move! (정지 상태를 유지하며 억울한 표정으로 선생님을 바라봄)",
  "Is it my turn? (옆 친구의 어깨를 톡톡 두드리며 순서를 확인함)",
  "I found it! (책상 서랍 안을 가리키며 밝게 웃음)"
];

// Checksum to prevent accidental replacement
export const EXAMPLES_CHECKSUM = "FEB25_ACTION_FOCUSED_V1";

if (STATIC_STUDENT_EXAMPLES.length === 0) {
  console.warn("ESL GAME LAB: Student examples content file is empty!");
}
