# How many bits of information are enough to become copyrightable?

## Threshold of originality

In copyright law, there exists something called "Threshold of originality". The definition is very nebulous and
dependent on specific jurisdiction. Few excerpts from the related wikipedia article:

> The court opinion stated that copyright protection could only be granted to "works of authorship" that possess "at least some minimal degree of creativity". As such, mere labour ("sweat of the brow") is not sufficient to establish a copyright claim.

>In March 2012, the European Court of Justice also set a similar precedent, ruling that Football DataCo could not claim copyright on association football match schedules due to the skill and labour used in their creation, as their compilation is "dictated by rules or constraints which leave no room for creative freedom"

## Quantifying the threshold

Given the nature of copyright, and in fact of creative works in general, it's kinda hard to draw a line dividing "original enough" and "too simple" for copyright. Certainly, the answer would be very different depending on a specific medium, for example. So let's constrain ourselves to a very limited, simplified medium and see where we can go with it.

## Draw-with-bits program

This repository contains a simple JavaScript program that allows the user to draw an image consisting of a collection of lines. The input to the program is a single number, which is then split into bits, and each bit influences some property of a line. This is a drawing program; far cry from Photoshop or even MS Paint, but a drawing program nonetheless. With this we can conduct our experiment if we assume the following (and courts could very well disagree on those):

### The draw-with-bits program is a medium

Just like other graphic editors, the program is a medium, a tool, a utility, and not an art piece _by itself_. This is
important, as it means that any images created in it are fully original, and not derivative works. In the worst case interpretation
the created images would be considered entirely a part of the "draw-with-bits art piece", sidestepping the problem we're
considering here entirely. So just like a drawing made in MS Paint is not considered to be a derivative work of MS Paint,
let's assume the same here.

### There exists enough room for artistic creativity in the program to create a copyrightable work

If the program made only parallel black lines, and all you could influence was how many of them were drawn, it could be argued
that no matter how many lines you decided to draw, the medium was too limited to allow a meaningful artistic expression.
This program allows setting color, position, and rotation of each line, which hopefully would clear that threshold.

### The program requires, or at least allows, for specific decision by the author.

If the program hashed the input number to essentially create a random image each time, once again it could be argued that
the medium lacks enough room for artistic creativity, as the author would not have any meaningful control over the output.
Here, however, every bit has a specific meaning and can be hand-tuned.

## The interface

There are two input boxes. The first one sets the number of bits considered. The second is the actual input. You can get different outputs
using as little as 2 bits, but actually considerably different outputs start appearing at 8, with lines having different positions and orientations.
The higher you set the bit length, the more lines will appear, and each line will have more possible states. Unfortunately, the
same line can be represented by quite a few different bit sequences, especially at smaller bit lengths, which limits the "room for artistic creativity" or whatever,
but I can't be bothered to change the algorithm.

## Acknowledgements

I'm playing rather fast and loose with the interpretation of copyright law here. Nothing here is to be constituted as legal advice.
I came up with the idea quite some time ago by myself, but the actual implementation i vibecoded in an hour or so.




