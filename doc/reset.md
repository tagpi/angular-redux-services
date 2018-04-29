# @@RESET

A global reset is provided by the redux service. 

To call the reset: 

```typescript
reduxService.reset();
```

or run a dispatch manually:

```typescript
reduxService.dispatch({ type: '@@RESET' });
reduxService.dispatch({ type: ReduxService.resetActionType });
```

## Preserve 

To skip the global reset and preserve the data for a state slice, add the following code in the service:

```typescript
static preserve = true;
```

## Overriding Reset

Create an @rxAction with '@@RESET' to override the reset function.

```typescript
@rxAction() ['@@RESET']() {
  return (state: State) => {
    state.result = [];
  };
}
```

## Change the reset action type

To change the reset action type, change the resetActionType property when you initialize ReduxService

```typescript
ReduxService.resetActionType = '@my-reset';
```
