# Swipeable card (intent-aware gestures)

Expo + React Native demo: a card stack that **only captures horizontal swipes** when the gesture looks intentionally horizontal, so **vertical scrolling** on the same screen keeps working.

If this repo helps you, **leave a star** — it makes a difference.

---

## Demo

<table>
<tr valign="top">
<td width="55%">

<video src="demo.mp4" controls playsinline width="400">
  <a href="demo.mp4">Open demo.mp4</a>
</video>

</td>
<td width="45%">

Gesture angle schematic (movement relative to axes in <code>SwipeableCard.js</code>):

<pre>
↑
│
│
│small angle         /
│                 /
│              /  
│           /
│        /
│     /  large angle
│  /
└────────────────→
</pre>

Rough mapping: shallow angle (~horizontal drift) tends toward horizontal card intent;
steeper angle tends toward vertical / scroll territory.

</td>
</tr>
</table>

---

## Reproduce locally

**Requirements:** Node.js (LTS), npm, and [Expo Go](https://expo.dev/go) or a dev build.

```bash
git clone <repo-url>
cd <repo-folder>
npm install
npx expo start
```

Then scan the QR code (Expo Go) or press `i` / `a` for simulator.

**Sample images:** add `assets/cards/card-1.png` … `card-6.png`. Paths must match `src/sampleData.js` (`require(...)`).

---

## Gesture & intent logic (high level)

Implementation lives in `src/SwipeableCard.js`.

1. **Intent from movement**  
   From `dx` / `dy`, an angle is derived (`atan2`). Rough bands:
   - **~0–30°** from horizontal → treated as **horizontal** intent (card pan eligible).
   - **~60–90°** → **vertical** intent (card does not claim the gesture).
   - **Between** → **undecided** until the user moves further (reduces accidental horizontal locks while scrolling).

2. **PanResponder**  
   `onMoveShouldSetPanResponder` returns `true` only when intent is horizontal, so parent `ScrollView` can own vertical drags.

3. **Commit threshold**  
   On release, a swipe counts if displacement or velocity crosses a threshold (see code); otherwise the card springs back.

4. **Ending card**  
   Optional final screen after the last card; horizontal swipe resets the deck (animations reset so the first card is visible again).

Tune angles, minimum distance before deciding intent, and swipe thresholds in one place to match your product.

---

## Why it’s useful

Any UI that needs **both**:

- **Horizontal:** next / dismiss / choose (cards, stories, queues).  
- **Vertical:** scroll long content on the **same** screen.

Examples: onboarding inside a scrollable page, discovery feeds with a stacked hero, profiles or media queues where you don’t want horizontal detection to fight vertical scroll.

---

## Where this could go next

- Centralized config (angles, thresholds, haptics).  
- Left vs right meaning different actions (pass / like).  
- Vertical gestures for secondary actions (e.g. save) while preserving scroll when intent is ambiguous.  
- Integration with `react-native-gesture-handler` / Reanimated for even richer choreography.

---

## Project layout

| Path | Role |
|------|------|
| `App.js` | `SafeAreaProvider`, scrollable shell, demo copy |
| `src/SwipeableCard.js` | Stack + pan logic + optional ending card |
| `src/sampleData.js` | Local `require()` image list |

---

## License

[MIT](LICENSE) — see the `LICENSE` file for full text.
