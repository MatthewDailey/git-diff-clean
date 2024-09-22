# Notes

These are some working notes as I thought through what I wanted this module to be.

## Example real 1-line diff:

```
diff --git a/cli/src/ai.ts b/cli/src/ai.ts
index e4ccc86..64c8f8a 100644
--- a/cli/src/ai.ts
+++ b/cli/src/ai.ts
@@ -138,7 +138,6 @@ export async function callChatCompletionsWithToolsAndExecuteTools(

     try {
       const output = response.choices[0]?.message?.content || ''
-      doToolCalls(response.choices[0]?.message?.tool_calls)
       return output
     } catch (e) {
       error(e.stack)
```

In this example, the `@@ ... @@` will link to the range of code.

With `git diff -U0` we'll get the precise line.

```
diff --git a/cli/src/ai.ts b/cli/src/ai.ts
index e4ccc86..64c8f8a 100644
--- a/cli/src/ai.ts
+++ b/cli/src/ai.ts
@@ -141 +140,0 @@ export async function callChatCompletionsWithToolsAndExecuteTools(
-      doToolCalls(response.choices[0]?.message?.tool_calls)
(END)
```

Ideally:

- we want a link to the precise line
- the surrounding context.
- the link should look nice

## Example larger diff

```
diff --git a/cli/src/ai.ts b/cli/src/ai.ts
index e4ccc86..b7464d8 100644
--- a/cli/src/ai.ts
+++ b/cli/src/ai.ts
@@ -138,10 +138,11 @@ export async function callChatCompletionsWithToolsAndExecuteTools(

     try {
       const output = response.choices[0]?.message?.content || ''
+      console.log(response)
       doToolCalls(response.choices[0]?.message?.tool_calls)
       return output
     } catch (e) {
-      error(e.stack)
+      console.log(response)
     } finally {
       trackLlmUsage(
         span,
```

The format is `@@ -<line_num>,<number_of_lines>, +<line_num>,<number_of_lines> @@`

A cleaner output would be:

```
cli/src/ai.ts:138 [async function callChatCompletionsWithToolsAndExecuteTools]
     try {
       const output = response.choices[0]?.message?.content || ''
+      console.log(response)
       doToolCalls(response.choices[0]?.message?.tool_calls)
       return output
     } catch (e) {
-      error(e.stack)
+      console.log(response)
     } finally {
       trackLlmUsage(
         span,
```

Can pipe to `less -R` as a pager to view the output.

## Multi edit example

```
diff --git a/cli/src/ai.ts b/cli/src/ai.ts
index e4ccc86..5ef2bb9 100644
--- a/cli/src/ai.ts
+++ b/cli/src/ai.ts
@@ -166,8 +166,6 @@ function doToolCalls(toolCalls: ChatCompletionMessageToolCall[]) {
       name: toolCall.function.name,
       args: toolCall.function.arguments,
     })),
-  )
-  for (const toolCall of coallescedToolCalls) {
     doCall(toolCall)
   }
 }
diff --git a/cli/src/context.ts b/cli/src/context.ts
index 713d29d..2bbb361 100644
--- a/cli/src/context.ts
+++ b/cli/src/context.ts
@@ -15,9 +15,6 @@ export async function generateContextFromFolder(
 ): Promise<Array<ChatCompletionMessageParam>> {
   const stopThinking = showThinkingAnimation ? startThinkingAnimation('Building context') : () => {}
   return new Promise((resolve) => {
-    const folder = getFolder(directory)
-    logFolderAndFiles(folder)
-
     const serializedFolder = serializeFolderStructure(folder)
```

can use the `diff --git` to split and then parse entries
