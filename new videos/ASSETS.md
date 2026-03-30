# Video Assets — SeaFarer Landing Page

All assets share the same visual language: **low-poly 3D**, **dusk/twilight lighting** (purple-blue sky), **teal polygon ocean**, **warm amber practical lights**, generated via Veo.

---

## Still Images

### `shipInTheSea.png`
The primary establishing shot. The cargo ship sailing in open ocean, viewed from a **rear-right three-quarter angle**. Searchlight beam cuts forward-left. Indonesian flag visible at stern. Polygon waves, dusk sky with scattered clouds. Used as the base/loop frame.

### `shipFromTheFront.png`
The same cargo ship viewed from a **front-left three-quarter angle**, close-up. Mast, rigging, and bow visible. A crew figure in high-vis vest stands on deck. Searchlight pointing toward camera. Open ocean horizon behind the ship.

### `shipInThePort.png`
Wide **establishing port scene**. Multiple vessels docked — the main cargo ship at the right pier with searchlight active, smaller fishing boats in the middle, cargo cranes and coloured shipping containers along the quay, warehouse buildings in the background. Warm dock lighting.

### `shipInterior.png`
**Ship bridge / wheelhouse interior**. Navigation chart screens, radar display, instrument panels across the console. A uniformed officer stands at the controls on the right. Dusk ocean and purple sky visible through the forward windows. Indonesian flag visible on the left window ledge.

### `vrHeadset.png`
**Product hero shot**. A low-poly VR headset resting flat on a teal polygon ocean surface, dark deep-navy background. Lens detail visible. Standalone asset — intended for a "platform experience" or feature section on the landing page.

---

## Transition Videos

All videos: **1920×1080 · H.264 · 8 seconds**

### `shipInTheSeaToshipInTheSea.mp4`
**Ambient loop** — starts and ends at the rear-right open-sea view. Subtle camera drift and wave motion only. Intended as a background loop for landing page hero sections.

### `shipInTheSeaToshipFromTheFront.mp4`
**Sea → Front transition.** Camera performs a slow counterclockwise orbital arc around the hull at constant radius and elevation — rear-right angle rotates to front-left, revealing bow and rigging. No zoom, no tilt.

### `shipInTheSeaToshipInThePort.mp4`
**Sea → Port transition.** Camera dollies forward along the ship's heading axis (rear-right angle held). Open ocean gives way to port infrastructure — cranes, docked vessels, and dock lights emerge in the background until the ship is fully berthed.

### `shipFromTheFrontToshipInterior.mp4`
**Front → Interior transition.** Camera pushes in on a straight axis toward the bridge windows from the front-left angle, crosses the glass threshold, and dissolves into the wheelhouse with navigation screens and the officer at the controls.

### `shipInThePortToshipInTheSea.mp4`
**Port → Sea transition.** Camera pulls back along the ship's departure axis as the vessel leaves the dock. Port infrastructure shrinks behind, ocean opens ahead, ending at the rear-right open-sea view.

### `shipInThePortToshipInThePort.mp4`
**Ambient port loop** — starts and ends at the same wide port scene. Subtle wave motion and dock light flicker only, no camera movement. Mirror of `shipInTheSeaToshipInTheSea` for port-context sections.

---

## Suggested Playback Sequence (Landing Page)

```
shipInTheSeaToshipInTheSea      ← hero background loop
  ↓ on scroll / cue
shipInTheSeaToshipFromTheFront  ← orbit reveal
  ↓
shipFromTheFrontToshipInterior  ← enter the bridge
  ↓
shipInTheSeaToshipInThePort     ← arrive at port
  ↓
shipInThePortToshipInTheSea     ← depart back to sea (loop back)
```
