import { parseDiff, splitFilesInDiff } from './show_diff'

const SAMPLE_DIFF_1 = `diff --git a/public/index.html b/public/index.html
index 3664159..b0e9a85 100644
--- a/public/index.html
+++ b/public/index.html
@@ -171,8 +171,6 @@
     function initiateSequence() {
       if (exerciseSequence) {
         sequenceStarted = true;
-        document.getElementById('startButton').style.display = 'none';
-        document.getElementById('sequenceName').style.display = 'none';
         document.getElementById('totalDuration').style.display = 'none';
         document.getElementById('currentExercise').style.display = 'block';
         startExercise(currentIndex);`

const SAMPLE_DIFF_2 = `diff --git a/public/index.html b/public/index.html
index 3664159..a9baef3 100644
--- a/public/index.html
+++ b/public/index.html
@@ -244,10 +244,10 @@
       const prevExercise = exerciseSequence.sequence[index - 1];
       const nextExercise = exerciseSequence.sequence[index + 1];
 
-      document.getElementById('previousExercise').textContent = prevExercise ? prevExercise.name : '';
-      document.getElementById('currentExercise').textContent = currentExercise.name;
       document.getElementById('timer').textContent = currentExercise.duration;
       document.getElementById('nextExercise').textContent = nextExercise ? nextExercise.name : '';
+      document.getElementById('previousExercise').textContent = prevExercise ? prevExercise.name : '';`

const SAMPLE_DIFF_3 = `diff --git a/generate_audio.py b/generate_audio.py
index 046c3b1..173e598 100644
--- a/generate_audio.py
+++ b/generate_audio.py
@@ -21,10 +21,6 @@ OUTPUT_DIRECTORY = "public/audio"
 
 
 def main(args):
-    # 1. read sequence json file
-    # 2. for each item in sequence, generate audio and save to output directory if not already there
-    # 3. update sequence json file with audio path
-    # 4. save sequence json file
 
     with open(args.sequence_file) as f:
         sequence = json.load(f)
diff --git a/public/index.html b/public/index.html
index 3664159..a9baef3 100644
--- a/public/index.html
+++ b/public/index.html
@@ -244,10 +244,10 @@
       const prevExercise = exerciseSequence.sequence[index - 1];
       const nextExercise = exerciseSequence.sequence[index + 1];
 
-      document.getElementById('previousExercise').textContent = prevExercise ? prevExercise.name : '';
-      document.getElementById('currentExercise').textContent = currentExercise.name;
       document.getElementById('timer').textContent = currentExercise.duration;
       document.getElementById('nextExercise').textContent = nextExercise ? nextExercise.name : '';
+      document.getElementById('previousExercise').textContent = prevExercise ? prevExercise.name : '';
+      document.getElementById('currentExercise').textContent = currentExercise.name;
 
       let audio = new Audio(currentExercise.audio_url);
       audio.play();`

const SAMPLE_DIFF_4 = `diff --git a/git-diff-clean/src/show_diff.test.ts b/git-diff-clean/src/show_diff.test.ts
index 5576c39..4e5f6f0 100644
--- a/git-diff-clean/src/show_diff.test.ts
+++ b/git-diff-clean/src/show_diff.test.ts
@@ -86,7 +86,7 @@ test('should parse a single diff correctly', () => {
   expect(result[0]).toMatchObject({
     path: 'public/index.html',
     lineNumber: 171,
-    diff: expect.any(String),
+    contents: expect.any(String),
   })
 })
 
@@ -96,7 +96,7 @@ test('should parse multiple diffs correctly', () => {
   expect(result[0]).toMatchObject({
     path: 'public/index.html',
     lineNumber: 244,
-    diff: expect.any(String),
+    contents: expect.any(String),
   })
 })
 
@@ -106,11 +106,11 @@ test('should parse multiple diffs correctly', () => {
   expect(result[0]).toMatchObject({
     path: 'generate_audio.py',
     lineNumber: 21,
-    diff: expect.any(String),
+    contents: expect.any(String),
   })
   expect(result[1]).toMatchObject({
     path: 'public/index.html',
     lineNumber: 244,
-    diff: expect.any(String),
+    contents: expect.any(String),
   })
 })`

test('should split a single diff correctly', () => {
  const result = splitFilesInDiff(SAMPLE_DIFF_1)
  expect(result).toHaveLength(1)
  expect(result[0]).toContain('diff --git a/public/index.html b/public/index.html')
})

test('should split multiple diffs correctly', () => {
  const result = splitFilesInDiff(SAMPLE_DIFF_2)
  expect(result).toHaveLength(1)
  expect(result[0]).toContain('diff --git a/public/index.html b/public/index.html')
})

test('should handle multiple files in a single diff', () => {
  const result = splitFilesInDiff(SAMPLE_DIFF_3)
  expect(result).toHaveLength(2)
  expect(result[0]).toContain('diff --git a/generate_audio.py b/generate_audio.py')
  expect(result[1]).toContain('diff --git a/public/index.html b/public/index.html')
})

test('should parse a single diff correctly', () => {
  const result = parseDiff(SAMPLE_DIFF_1)
  expect(result).toHaveLength(1)
  expect(result[0]).toMatchObject({
    path: 'public/index.html',
    lineNumber: 171,
    contents: expect.any(String),
  })
})

test('should parse multiple diffs correctly', () => {
  const result = parseDiff(SAMPLE_DIFF_2)
  expect(result).toHaveLength(1)
  expect(result[0]).toMatchObject({
    path: 'public/index.html',
    lineNumber: 244,
    contents: expect.any(String),
  })
})

test('should parse multiple diffs correctly', () => {
  const result = parseDiff(SAMPLE_DIFF_3)
  expect(result).toHaveLength(2)
  expect(result[0]).toMatchObject({
    path: 'generate_audio.py',
    lineNumber: 21,
    contents: expect.any(String),
  })
  expect(result[1]).toMatchObject({
    path: 'public/index.html',
    lineNumber: 244,
    contents: expect.any(String),
  })
})

test('handles multiple diffs in a single file', () => {
  const result = parseDiff(SAMPLE_DIFF_4)
  expect(result).toHaveLength(3)
  expect(result[0]).toMatchObject({
    path: 'git-diff-clean/src/show_diff.test.ts',
    lineNumber: 86,
    contents: expect.any(String),
  })
  expect(result[1]).toMatchObject({
    path: 'git-diff-clean/src/show_diff.test.ts',
    lineNumber: 96,
    contents: expect.any(String),
  })
  expect(result[2]).toMatchObject({
    path: 'git-diff-clean/src/show_diff.test.ts',
    lineNumber: 106,
    contents: expect.any(String),
  })
})

test('should handle empty diff string', () => {
  const result = parseDiff('')
  expect(result).toEqual([])
})
