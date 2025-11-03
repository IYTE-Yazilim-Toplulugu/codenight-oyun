Design a single, dynamic game room page for a round-based drawing and guessing game. The app is built with Next.js (App Router), TypeScript, and Tailwind CSS. The page should have a fun, playful, and modern aesthetic with a light theme and rounded elements. Use a vibrant purple as the primary accent color.

The page must be a Client Component (`"use client";`) as it will manage a `gameState` variable (e.g., 'WAITING', 'GUESSING', 'RESULTS').

Create the following page and components:

1.  **Page: Game Room (`app/room/[roomId]/index.ts`)**
    * This page will use a CSS Grid or Flexbox layout to create three distinct areas: Header, Main Content, and Input Footer.
    * **Header Area (Top):**
        * This area should span the full width at the top.
        * It will contain the `GameHeader` component.
    * **Main Content Area (Middle):**
        * This area should be a two-column layout that fills the space between the header and footer.
        * **Left Column (e.g., 1/4 width):** The **"Player List"** area. It should have a title "Players" and display a vertical list of `PlayerCard` components.
        * **Right Column (e.g., 3/4 width):** The **"Image Container"** area. This is the main dynamic content block.
            * If `gameState` is 'GUESSING', display the image to be guessed.
            * If `gameState` is 'RESULTS', display the `ResultBook` component.
            * If `gameState` is 'WAITING', display a "Waiting for players..." message.
    * **Input Footer Area (Bottom):**
        * This area spans the full width at the bottom.
        * This is the main dynamic input block.
            * If `gameState` is 'GUESSING', display a multi-line `textarea` with a "Submit" button.
            * If `gameState` is 'RESULTS', display a "Play Again" button.
            * If `gameState` is 'WAITING', display input field in suspense.

2.  **Component: `components/GameHeader.tsx`**
    * A simple, full-width bar at the top.
    * It should display the game's "Room Code" on the left.
    * It should display "Round 1 of 8" and a "Time: 0:45" timer on the right.

3.  **Component: `components/PlayerCard.tsx`**
    * A simple rounded-box component.
    * It should display the player's name.
    * It should include a small visual indicator for their status (e.g., a green checkmark if 'Done', a pencil icon if 'Drawing/Writing').

5.  **Component: `components/ResultBook.tsx`**
    * This component is displayed in the "Image Container" during the 'RESULTS' state.
    * It should vertically stack the results of a single chain.
    * For example, it should show a sequence of items:
        * "Alice wrote: A cat flying a spaceship"
        * ""
        * "Carlos guessed: A rocket cat"
        * ""
