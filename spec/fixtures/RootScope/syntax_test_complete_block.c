// SYNTAX TEST "source.c"
int square(int x)
// <- storage.type
//  ^ meta.function entity.name.function
//         ^ storage.type
{
    return x * x;
}
// The brace is closed
