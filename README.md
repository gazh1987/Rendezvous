This is a level-one setext-style header
==================

A level-two header
------------------

A setext-style header is a line of text "underlined" with a row of = signs (for a level one header) or - signs (for a level two header):

A paragraph is one or more lines of text followed by one or more blank line. Newlines are treated as spaces, so you can reflow your paragraphs as you like. If you need a hard line break, put two or more spaces at the end of a line.

A backslash followed by a newline is also a hard line break. Note: in multiline and grid table cells, this is the only way to create a hard line break, since trailing spaces in the cells are ignored.

There are two kinds of headers, Setext and atx.

# This is a level one Atx-style header

## A level-two header

### A level-three header ###



An Atx-style header consists of one to six # signs and a line of text, optionally followed by any number of # signs. The number of # signs at the beginning of the line is the header level.

Markdown uses email conventions for quoting blocks of text. A block quotation is one or more paragraphs or other block elements (such as lists or headers), with each line preceded by a > character and a space. (The > need not start at the left margin, but it should not be indented more than three spaces.)

> This is a block quote. This
> paragraph has two lines.
>
> 1. This is a list inside a block quote.
> 2. Second item.

A "lazy" form, which requires the > character only on the first line of each block, is also allowed:

> This is a block quote. This
paragraph has two lines.

> 1. This is a list inside a block quote.
2. Second item.

Among the block elements that can be contained in a block quote are other block quotes. That is, block quotes can be nested:

> This is a block quote.
>
> > A block quote within a block quote.

Standard markdown syntax does not require a blank line before a block quote. Pandoc does require this (except, of course, at the beginning of the document). The reason for the requirement is that it is all too easy for a > to end up at the beginning of a line by accident (perhaps through line wrapping). So, unless the markdown_strict format is used, the following does not produce a nested block quote in pandoc:

> This is a block quote.
>> Nested.

In addition to standard indented code blocks, Pandoc supports fenced code blocks. These begin with a row of three or more tildes (~) or backticks (`) and end with a row of tildes or backticks that must be at least as long as the starting row. Everything between these lines is treated as code. No indentation is necessary:

~~~~~~~
if (a > 3) {
  moveShip(5 * gravity, DOWN);
}
~~~~~~~

Like regular code blocks, fenced code blocks must be separated from surrounding text by blank lines.

If the code itself contains a row of tildes or backticks, just use a longer row of tildes or backticks at the start and end.

~~~~~~{#mycode .python .numberLines }
# This is a python example
class MyClass(object):
    pass

def main():
    pass
if __name__ == "__main__":
   main()
~~~~~~

## Lists {#stuff}

A bullet list is a list of bulleted list items. A bulleted list item begins with a bullet (*, +, or -). Here is a simple example:

* one
* two
* three

This will produce a "compact" list. If you want a "loose" list, in which each item is formatted as a paragraph, put spaces between the items:

* one

* two

* three

The bullets need not be flush with the left margin; they may be indented one, two, or three spaces. The bullet must be followed by whitespace.

List items look best if subsequent lines are flush with the first line (after the bullet):

* here is my first
  list item.
* and my second.

But markdown also allows a "lazy" format:

* here is my first
list item.
* and my second.

The four-space rule

A list item may contain multiple paragraphs and other block-level content. However, subsequent paragraphs must be preceded by a blank line and indented four spaces or a tab. The list will look better if the first paragraph is aligned with the rest:

  * First paragraph.

    Continued.

  * Second paragraph. With a code block, which must be indented
    eight spaces:

        { code }

List items may include other lists. In this case the preceding blank line is optional. The nested list must be indented four spaces or one tab:

* fruits
    + apples
        - macintosh
        - red delicious
    + pears
    + peaches
* vegetables
    + broccoli
    + chard

As noted above, markdown allows you to write list items "lazily," instead of indenting continuation lines. However, if there are multiple paragraphs or other blocks in a list item, the first line of each must be indented.

+ A lazy, lazy, list
item.

+ Another one; this looks
bad but is legal.

    Second paragraph of second
list item.

Note: Although the four-space rule for continuation paragraphs comes from the official markdown syntax guide, the reference implementation, Markdown.pl, does not follow it. So pandoc will give different results than Markdown.pl when authors have indented continuation paragraphs fewer than four spaces.

The markdown syntax guide is not explicit whether the four-space rule applies to all block-level content in a list item; it only mentions paragraphs and code blocks. But it implies that the rule applies to all block-level content (including nested lists), and pandoc interprets it that way.

## Ordered lists

Ordered lists work just like bulleted lists, except that the items begin with enumerators rather than bullets.

In standard markdown, enumerators are decimal numbers followed by a period and a space. The numbers themselves are ignored, so there is no difference between this list:

1.  one
2.  two
3.  three

and this one:

5.  one
7.  two
1.  three

Unlike standard markdown, Pandoc allows ordered list items to be marked with uppercase and lowercase letters and roman numerals, in addition to arabic numerals. List markers may be enclosed in parentheses or followed by a single right-parentheses or period. They must be separated from the text that follows by at least one space, and, if the list marker is a capital letter with a period, by at least two spaces.1

The fancy_lists extension also allows '#' to be used as an ordered list marker in place of a numeral:

#. one
#. two


Pandoc also pays attention to the type of list marker used, and to the starting number, and both of these are preserved where possible in the output format. Thus, the following yields a list with numbers followed by a single parenthesis, starting with 9, and a sublist with lowercase roman numerals:

 9)  Ninth
10)  Tenth
11)  Eleventh
       i. subone
      ii. subtwo
     iii. subthree

Pandoc will start a new list each time a different type of list marker is used. So, the following will create three lists:

(2) Two
(5) Three
1.  Four
*   Five

If default list markers are desired, use #.:

#.  one
#.  two
#.  three

## Tables

Simple tables look like this:

  Right     Left     Center     Default
-------     ------ ----------   -------
     12     12        12            12
    123     123       123          123
      1     1          1             1

Table:  Demonstration of simple table syntax.

The headers and table rows must each fit on one line. Column alignments are determined by the position of the header text relative to the dashed line below it.


Grid tables look like this:

: Sample grid table.

+---------------+---------------+--------------------+
| Fruit         | Price         | Advantages         |
+===============+===============+====================+
| Bananas       | $1.34         | - built-in wrapper |
|               |               | - bright color     |
+---------------+---------------+--------------------+
| Oranges       | $2.10         | - cures scurvy     |
|               |               | - tasty            |
+---------------+---------------+--------------------+

The row of =s separates the header from the table body, and can be omitted for a headerless table. The cells of grid tables may contain arbitrary block elements (multiple paragraphs, code blocks, lists, etc.). Alignments are not supported, nor are cells that span multiple columns or rows.

## Emphasis

To emphasize some text, surround it with *s or _, like this:

This text is _emphasized with underscores_, and this
is *emphasized with asterisks*.

Double * or _ produces strong emphasis:

This is **strong emphasis** and __with underscores__.

A * or _ character surrounded by spaces, or backslash-escaped, will not trigger emphasis:

This is * not emphasized *, and \*neither is this\*.


## Links

Markdown allows links to be specified in several ways.
Automatic links

If you enclose a URL or email address in pointy brackets, it will become a link:

<http://google.com>\
<sam@green.eggs.ham>

### Inline links

An inline link consists of the link text in square brackets, followed by the URL in parentheses. (Optionally, the URL can be followed by a link title, in quotes.)

This is an [inline link](/url), and here's [one with a title](http://fsf.org "click here for a good time!").

There can be no space between the bracketed part and the parenthesized part. The link text can contain formatting (such as emphasis), but the title cannot.


## Images

An image occurring by itself in a paragraph will be rendered as a figure with a caption.4 (In LaTeX, a figure environment will be used; in HTML, the image will be placed in a div with class figure, together with a caption in a p with class caption.) The image's alt text will be used as the caption.

![This is the caption](untitled.png)

If you just want a regular inline image, just make sure it is not the only thing in the paragraph. One way to do this is to insert a nonbreaking space after the image:

![This image won't be a figure](untitled.png)\


## Maths

Here are some examples of maths formatting. It's basically inline LaTeX between double dollar symbols -- \$\$...\$\$

$$ \frac{n!}{k!(n-k)!} = \binom{n}{k} $$

$$ \forall x \in X, \quad \exists y \leq \epsilon $$

$$ \sum_{i=1}^{10} t_i $$

$$ \int_0^\infty \mathrm{e}^{-x}\,\mathrm{d}x $$

## Footnotes

Inline footnotes are also allowed (though, unlike regular notes, they cannot contain multiple paragraphs). The syntax is as follows:

Here is an inline note.^[Inlines notes are easier to write, since you don't have to pick an identifier and move down to type the note.]

Inline and regular footnotes may be mixed freely.

## Referencing

If I wanted to stick in a reference I could use this format: [see @someref]. I could also have said that @someref says blah. I can also say that [@ltuae] or [@website:mafoley] might have something to say.

