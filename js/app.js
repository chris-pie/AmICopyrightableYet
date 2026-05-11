const CANVAS_SIZE = 512;
const MAX_SAFE_BITS = 53;
const MAX_BITS_PER_LINE = 32;
const MIN_BITS_PER_LINE = 6;
const INFINITE_LINE_LENGTH = Math.sqrt(CANVAS_SIZE * CANVAS_SIZE * 2) * 2;

function drawEncodedImage(numberOfBits, encodedImage) {
  const lineDetails = [];
  const canvas = document.getElementById('image-canvas');

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element with id "image-canvas" was not found.');
  }

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D canvas context.');
  }

  const safeBitCount = Math.max(0, Math.floor(numberOfBits));
  let imageBits = decimalStringToBigInt(encodedImage);

  if (safeBitCount === 0) {
    clearCanvas(ctx);
    renderLineDetails([]);
    return;
  }

  imageBits = truncateToBits(imageBits, safeBitCount);

  const targetBitsPerLine = calculateTargetBitsPerLine(safeBitCount);
  const lineCount = Math.max(
    1,
    Math.ceil(safeBitCount / targetBitsPerLine)
  );

  clearCanvas(ctx);

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
    const startBit = Math.floor((lineIndex * safeBitCount) / lineCount);
    const endBit = Math.floor(((lineIndex + 1) * safeBitCount) / lineCount);
    const bitsForLine = endBit - startBit;

    if (bitsForLine <= 0) {
      continue;
    }

    const lineValue = extractBits(imageBits, startBit, bitsForLine);
    const lineBitString = lineValue
      .toString(2)
      .padStart(bitsForLine, '0');

    const lineParameters = drawEncodedLine(ctx, lineValue, bitsForLine);

    lineDetails.push({
      index: lineIndex + 1,
      bitString: lineBitString,
      parameters: lineParameters,
    });
  }

  renderLineDetails(lineDetails);
}

function decimalStringToBigInt(value) {
  const decimalString = String(value).trim();

  if (!/^\d+$/.test(decimalString)) {
    throw new Error('Encoded image must be a string containing only decimal digits.');
  }

  return BigInt(decimalString);
}

function calculateTargetBitsPerLine(totalBits) {
  const growth = Math.log2(totalBits + 1);
  const targetBits = Math.round(MIN_BITS_PER_LINE + growth * 2);

  return Math.max(
    MIN_BITS_PER_LINE,
    Math.min(MAX_BITS_PER_LINE, targetBits)
  );
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function truncateToBits(value, bitCount) {
  const mask = (1n << BigInt(bitCount)) - 1n;
  return value & mask;
}

function extractBits(value, startBit, bitCount) {
  const mask = (1n << BigInt(bitCount)) - 1n;
  return (value >> BigInt(startBit)) & mask;
}

function drawEncodedLine(ctx, lineValue, bitsForLine) {
  const distribution = distributeLineBits(bitsForLine);

  const xRaw = takeBits(lineValue, 0, distribution.x);
  const yRaw = takeBits(lineValue, distribution.x, distribution.y);
  const rotationRaw = takeBits(
    lineValue,
    distribution.x + distribution.y,
    distribution.rotation
  );
  const colorRaw = takeBits(
    lineValue,
    distribution.x + distribution.y + distribution.rotation,
    distribution.color
  );

  const x = scaleInteger(xRaw, distribution.x, 0, CANVAS_SIZE);
  const y = scaleInteger(yRaw, distribution.y, 0, CANVAS_SIZE);
  const rotation = scaleInteger(rotationRaw, distribution.rotation, 0, Math.PI * 2);

  const color = colorFromBits(colorRaw, distribution.color);

  const halfLength = INFINITE_LINE_LENGTH / 2;
  const dx = Math.cos(rotation) * halfLength;
  const dy = Math.sin(rotation) * halfLength;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x - dx, y - dy);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();

  return {
    x,
    y,
    rotation,
    color,
  };
}

function distributeLineBits(bitsForLine) {
  const clampedBits = Math.max(1, Math.min(MAX_BITS_PER_LINE, bitsForLine));

  const distribution = {
    x: 0,
    y: 0,
    rotation: 0,
    color: 0,
  };

  const order = ['x', 'y', 'rotation', 'color'];

  for (let bitIndex = 0; bitIndex < clampedBits; bitIndex += 1) {
    distribution[order[bitIndex % order.length]] += 1;
  }

  return distribution;
}

function takeBits(value, offset, count) {
  if (count <= 0) {
    return 0n;
  }

  const mask = (1n << BigInt(count)) - 1n;
  return (value >> BigInt(offset)) & mask;
}

function scaleInteger(value, bitCount, min, max) {
  if (bitCount <= 0) {
    return min;
  }

  const maxEncodedValue = Number((1n << BigInt(bitCount)) - 1n);

  if (maxEncodedValue === 0) {
    return min;
  }

  return min + (Number(value) / maxEncodedValue) * (max - min);
}

function colorFromBits(value, bitCount) {
  if (bitCount <= 0) {
    return '#000000';
  }

  const maxEncodedValue = Number((1n << BigInt(bitCount)) - 1n);
  const normalized = maxEncodedValue === 0 ? 0 : Number(value) / maxEncodedValue;

  const hue = normalized * 360;
  const saturation = 65;
  const lightness = 45;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getDecimalStringBitLength(value) {
  const decimalString = String(value).trim();

  if (!/^\d+$/.test(decimalString)) {
    return 0;
  }

  const parsedValue = BigInt(decimalString);

  if (parsedValue === 0n) {
    return 0;
  }

  return parsedValue.toString(2).length;
}

function updateEncodedValueWarning(bitsInput, encodedValueInput) {
  const numberOfBits = Math.max(0, Math.floor(Number(bitsInput.value)));
  const encodedValue = encodedValueInput.value.trim() || '0';
  const encodedValueBitLength = getDecimalStringBitLength(encodedValue);

  encodedValueInput.classList.toggle(
    'input-warning',
    encodedValueBitLength > numberOfBits
  );
}

function redrawFromInputs() {
  const bitsInput = document.getElementById('bits-input');
  const encodedValueInput = document.getElementById('encoded-value-input');

  if (!(bitsInput instanceof HTMLInputElement)) {
    throw new Error('Input element with id "bits-input" was not found.');
  }

  if (!(encodedValueInput instanceof HTMLInputElement)) {
    throw new Error('Input element with id "encoded-value-input" was not found.');
  }

  const numberOfBits = Number(bitsInput.value);
  const encodedImage = encodedValueInput.value.trim() || '0';

  updateEncodedValueWarning(bitsInput, encodedValueInput);
  drawEncodedImage(numberOfBits, encodedImage);
}

function initializeControls() {
  const bitsInput = document.getElementById('bits-input');
  const encodedValueInput = document.getElementById('encoded-value-input');

  if (!(bitsInput instanceof HTMLInputElement)) {
    throw new Error('Input element with id "bits-input" was not found.');
  }

  if (!(encodedValueInput instanceof HTMLInputElement)) {
    throw new Error('Input element with id "encoded-value-input" was not found.');
  }

  bitsInput.addEventListener('input', redrawFromInputs);
  bitsInput.addEventListener('change', redrawFromInputs);

  encodedValueInput.addEventListener('input', redrawFromInputs);
  encodedValueInput.addEventListener('change', redrawFromInputs);

  redrawFromInputs();
}

initializeControls();

function renderLineDetails(lineDetails) {
  const lineDetailsList = document.getElementById('line-details-list');

  if (!(lineDetailsList instanceof HTMLElement)) {
    return;
  }

  lineDetailsList.replaceChildren();

  for (const lineDetail of lineDetails) {
    const wrapper = document.createElement('div');
    wrapper.className = 'line-detail';

    const title = document.createElement('strong');
    title.textContent = `Line ${lineDetail.index}`;

    const bitString = document.createElement('div');
    bitString.className = 'line-detail-bit-string';
    bitString.textContent = `Bits: ${lineDetail.bitString}`;

    const parameters = document.createElement('div');
    parameters.className = 'line-detail-parameters';
    parameters.textContent = [
      `x: ${lineDetail.parameters.x.toFixed(2)}`,
      `y: ${lineDetail.parameters.y.toFixed(2)}`,
      `rotation: ${lineDetail.parameters.rotation.toFixed(4)}`,
      `color: ${lineDetail.parameters.color}`,
    ].join(', ');

    wrapper.append(title, bitString, parameters);
    lineDetailsList.append(wrapper);
  }
}
