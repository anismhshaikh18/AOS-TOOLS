// Generates a clean, realistic default demo portrait matching the AOS PRINTER screenshot
export function getStockDemoPortraitDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 413;
  canvas.height = 531;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background: clean studio neutral gradient (light grey / studio soft white)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 531);
  bgGrad.addColorStop(0, '#E8ECF2');
  bgGrad.addColorStop(0.5, '#DFE5ED');
  bgGrad.addColorStop(1, '#CFD7E3');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 413, 531);

  // Soft background lighting halo behind head
  const haloGrad = ctx.createRadialGradient(206, 210, 20, 206, 210, 180);
  haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = haloGrad;
  ctx.fillRect(0, 0, 413, 531);

  // Shoulders & Navy T-shirt
  ctx.fillStyle = '#213348';
  ctx.beginPath();
  ctx.moveTo(40, 531);
  ctx.quadraticCurveTo(80, 400, 150, 390);
  ctx.quadraticCurveTo(206, 440, 263, 390);
  ctx.quadraticCurveTo(333, 400, 373, 531);
  ctx.closePath();
  ctx.fill();

  // T-Shirt Collar Line
  ctx.strokeStyle = '#152232';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, 390);
  ctx.quadraticCurveTo(206, 440, 263, 390);
  ctx.stroke();

  // Neck
  ctx.fillStyle = '#B48265';
  ctx.beginPath();
  ctx.moveTo(170, 310);
  ctx.lineTo(170, 410);
  ctx.quadraticCurveTo(206, 430, 243, 410);
  ctx.lineTo(243, 310);
  ctx.closePath();
  ctx.fill();

  // Neck Shadow under chin
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.moveTo(170, 310);
  ctx.quadraticCurveTo(206, 335, 243, 310);
  ctx.lineTo(243, 325);
  ctx.quadraticCurveTo(206, 350, 170, 325);
  ctx.closePath();
  ctx.fill();

  // Ears
  ctx.fillStyle = '#C28E70';
  ctx.beginPath();
  ctx.ellipse(126, 230, 14, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(287, 230, 14, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face Oval
  ctx.fillStyle = '#C99577';
  ctx.beginPath();
  ctx.ellipse(206, 220, 78, 105, 0, 0, Math.PI * 2);
  ctx.fill();

  // Forehead highlight
  const foreGrad = ctx.createRadialGradient(206, 175, 5, 206, 175, 50);
  foreGrad.addColorStop(0, 'rgba(255, 230, 215, 0.35)');
  foreGrad.addColorStop(1, 'rgba(255, 230, 215, 0)');
  ctx.fillStyle = foreGrad;
  ctx.fillRect(140, 130, 132, 90);

  // Black Hair with neat side-part
  ctx.fillStyle = '#181514';
  ctx.beginPath();
  ctx.moveTo(125, 210);
  ctx.quadraticCurveTo(120, 120, 180, 105);
  ctx.quadraticCurveTo(240, 95, 285, 125);
  ctx.quadraticCurveTo(295, 170, 288, 210);
  ctx.quadraticCurveTo(260, 165, 206, 160);
  ctx.quadraticCurveTo(155, 165, 125, 210);
  ctx.closePath();
  ctx.fill();

  // Eyebrows
  ctx.fillStyle = '#231F20';
  ctx.beginPath();
  // Left eyebrow
  ctx.moveTo(152, 195);
  ctx.quadraticCurveTo(175, 188, 192, 195);
  ctx.quadraticCurveTo(175, 185, 152, 195);
  ctx.fill();
  // Right eyebrow
  ctx.moveTo(220, 195);
  ctx.quadraticCurveTo(237, 188, 260, 195);
  ctx.quadraticCurveTo(237, 185, 220, 195);
  ctx.fill();

  // Eyes
  // Sclera
  ctx.fillStyle = '#F5F5F7';
  ctx.beginPath();
  ctx.ellipse(173, 208, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(239, 208, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris & Pupil (Dark Brown)
  ctx.fillStyle = '#2A1B14';
  ctx.beginPath();
  ctx.arc(173, 208, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(239, 208, 6, 0, Math.PI * 2);
  ctx.fill();

  // Catchlight (reflection in eyes)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(171, 206, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(237, 206, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Eyelids
  ctx.strokeStyle = '#382218';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(160, 207);
  ctx.quadraticCurveTo(173, 201, 186, 207);
  ctx.moveTo(226, 207);
  ctx.quadraticCurveTo(239, 201, 252, 207);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = '#9E6D52';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(206, 198);
  ctx.lineTo(204, 245);
  ctx.lineTo(213, 248);
  ctx.stroke();
  // Nostrils
  ctx.fillStyle = '#7C4F3B';
  ctx.beginPath();
  ctx.ellipse(198, 250, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(214, 250, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lips
  ctx.fillStyle = '#A35D50';
  ctx.beginPath();
  ctx.moveTo(186, 275);
  ctx.quadraticCurveTo(206, 268, 226, 275);
  ctx.quadraticCurveTo(206, 286, 186, 275);
  ctx.fill();

  // Neat Beard / Stubble
  ctx.fillStyle = 'rgba(28, 22, 20, 0.42)';
  ctx.beginPath();
  // Chin & jaw outline
  ctx.moveTo(140, 240);
  ctx.quadraticCurveTo(150, 310, 206, 323);
  ctx.quadraticCurveTo(262, 310, 272, 240);
  ctx.quadraticCurveTo(255, 300, 206, 310);
  ctx.quadraticCurveTo(157, 300, 140, 240);
  ctx.fill();
  // Moustache
  ctx.beginPath();
  ctx.moveTo(184, 268);
  ctx.quadraticCurveTo(206, 262, 228, 268);
  ctx.quadraticCurveTo(206, 272, 184, 268);
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.98);
}
