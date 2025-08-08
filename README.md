# Word Cloud Challenge

## Description

This application displays a word cloud based on topics loaded from a JSON file. Each topic’s font size is proportional to its volume, and color reflects the sentiment score:

- **Green**: sentimentScore > 60
- **Red**: sentimentScore < 40
- **Grey**: all others

Clicking on a word shows detailed sentiment breakdown (positive, neutral, negative) and total volume.

---

## Technologies Used

- React + TypeScript
- d3-cloud for word layout calculation
- CSS Modules + BEM for styling
- Vitest + React Testing Library for unit tests

---

## Getting Started (Local Setup)

### Prerequisites

- Node.js (v16 or newer recommended)
- npm or yarn

### Installation and Running

1. Clone the repository:

   ```bash
   git clone https://github.com/Nenad1Kozoder/My-Topics-Challenge.git
   cd word-cloud-challenge

   ```

2. Clone the repository:

   ```bash
     npm install
     # or
     yarn install

   ```

3. Run the development server::

   ```bash
   npm run dev
   # or
   yarn dev

   ```

4. Open your browser and navigate to:

   ```bash
   http://localhost:3000

   ```

5. Running Tests

   ```bash
   npm run dev
   # or
   yarn dev

   ```

## Additional Information

The code is structured modularly and follows good production standards.

The UI is responsive and supports both desktop and mobile/touch devices.

Basic test coverage ensures main functionality works as expected.

## Browser Support

Tested and compatible with modern browsers including:

- Chrome 62+
- Safari 11+
- MS Edge 40+
- Firefox 57+

## License

This project is open source and available under the MIT License.
