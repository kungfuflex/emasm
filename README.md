# emasm

EMASM is a JavaScript function that assembles any EVM bytecode from an AST which is actually expressed as a nested array. All EVM opcodes are available as lowercase, except numbers and hex strings are translated into PUSH instructions of the minimal required width to encode. Defining new segments of code which are reachable via a JUMPDEST is done by declaring an array where the first element is a unique string representing a jump label, and the second element is an array that contains your segment. The segment can be defined anywhere but the label is then usable anywhere in the program as a shorthand for a PUSH instruction encoding the jump destination.

Example:
```
emasm([
  '0x1', 'addatwo', 'jump',
  ['somelabel', ['0x0', 'mstore', '0x20', '0x0', 'return']],
  ['addatwo', ['0x2', 'add', 'somelabel', 'jump']],
]);

// computes 0x1 + 0x2 in an extremely obfuscated manner
```

Similar syntax exists for encoding raw bytes into the binary, in case you want to use CODECOPY to copy some data to memory for any reason. Just prefix your label with `bytes:` and anywhere in the program you can use `bytes:<label>:ptr` or `bytes:<label>:size`. The fact that the second element of the array for a bytes string is also an array is for consistency with the syntax for segments; elements in the array defining your bytes beyond the first element are simply discarded.

```
emasm([
  ['bytes:somelabel', ['0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff']],
  ['bytes:somelabel:ptr', 'bytes:somelabel:size']
]);

// defines a long bytes string with all bits set and then pushes the offset into the final binary where the bytes segment is encoded, then pushes the size in bytes of the string on the stack
```

The only other things to note in emasm is that your segments and bytes that you encode in the AST occur in the final binary in the order they appear. Additionally, the only special rules around nested arrays are when an array appears that follows the rules for defining labels or bytes segment. The entire array is essentially recursively flattened. The motivation for this is that it makes your macros completely composable without having to consider any sort of concat operations with arrays.

There is very little validation in the EMASM assembler function, primarily due to the idea that we want to max out the speed at which we can go from AST to bytecode on your dApp. I have various other copouts if you don't like that one. Eventually I will add an optional pass to the assembler that will provide errors.

## How do I even use assembly?

EVM assembly takes practice! But luckily, it's easier than assembly languages for modern chipsets. Skim the Ethereum yellow paper and pay close attention to the appendix for the list of possible opcodes. All of these opcodes can be used in EMASM!

For an easier reference after you're introduced, check out the Solidity docs for inline assembly, essentially the first argument to Solidity assembly functions must be the topmost position on the stack, second argument is the item on the stack pushed on immediately prior to the topmost, etc. Good luck.

## Author

flex
