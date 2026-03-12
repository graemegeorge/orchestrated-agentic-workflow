# Button

A composable Button component with variants, sizes, loading state, and icon support.

## Usage

```tsx
import { Button } from './components/Button';

// Primary button (default)
<Button>Click me</Button>

// Secondary with icons
<Button variant="secondary" leftIcon={<IconPlus />}>
  Add item
</Button>

// Ghost, small, loading
<Button variant="ghost" size="sm" loading>
  Saving...
</Button>

// Large with right icon
<Button size="lg" rightIcon={<IconArrow />}>
  Continue
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| loading | boolean | false | Show spinner, disable interaction |
| leftIcon | ReactNode | — | Icon before label |
| rightIcon | ReactNode | — | Icon after label |
| asChild | boolean | false | Merge onto child element |

## Accessibility

- Uses native `<button>` element
- Sets `aria-disabled` and `aria-busy` appropriately
- Keyboard: Enter and Space activate the button
- Supports `aria-label` for icon-only usage
