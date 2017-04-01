/* SYNTAX TEST "source.c" */
#pragma once
/* <- punctuation.definition.directive meta.preprocessor */
 /* <- keyword.control.directive.pragma */

#include "stdio.h"
/* <- keyword.control.directive.include */
/*       ^ meta string punctuation.definition.string.begin */
/*               ^ meta string punctuation.definition.string.end */
int square(int x)
/* <- storage.type */
/*  ^ meta.function entity.name.function */
/*         ^ storage.type */
{
    return x * x;
/*  ^^^^^^ keyword.control */
}

"Hello, World! not a comment";
/* ^ string.quoted.double */
/*                  ^ string.quoted.double */

/* EOF Check (root scope) */
/* >> source.c */
