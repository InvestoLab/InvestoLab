(function initInvestoTypeShare(global) {
  const modalState = {
    backdrop: null,
    image: null,
    ratioLabel: null,
    downloadBtn: null,
    payload: null,
    mode: 'square',
    dataUrl: '',
    fileName: 'investolab-investotype-result.png'
  };

  function clamp(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  function asText(value) {
    return String(value ?? '').trim();
  }

  function expandShareText(value) {
    return asText(value)
      .replace(/\s*\(([A-Z0-9.-]{1,10})\)\.?/g, '')
      .replace(/\bETF\b/g, 'Exchange-Traded Fund')
      .replace(/\bETFs\b/g, 'Exchange-Traded Funds')
      .replace(/\bSPDR\b/g, "Standard and Poor's Depositary Receipts")
      .replace(/\bS&P\b/g, "Standard and Poor's")
      .replace(/\bQQQ\b/g, 'Nasdaq One Hundred')
      .replace(/\bSPHQ\b/g, "Standard and Poor's Five Hundred Quality")
      .replace(/\bSPY\b/g, "Standard and Poor's Five Hundred")
      .replace(/\bSCHD\b/g, 'United States Dividend Equity')
      .replace(/\bAGG\b/g, 'Aggregate Bond')
      .replace(/\bVTI\b/g, 'Total Stock Market')
      .replace(/\bAOK\b/g, 'Conservative Allocation')
      .replace(/\bXLK\b/g, 'Technology Select Sector')
      .replace(/\bU\.S\.\b/g, 'United States')
      .replace(/\bUSD\b/g, 'United States Dollar')
      .replace(/\bAvg\b/gi, 'Average')
      .replace(/\bvs\.?\b/gi, 'versus')
      .replace(/\bDCA\b/g, 'dollar-cost averaging')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function shortenShareText(value, options = {}) {
    const text = expandShareText(value);
    if (!text) return '';
    const maxWords = Math.max(4, Number(options.maxWords || 18));
    const maxSentences = Math.max(1, Number(options.maxSentences || 1));
    const sentences = text.match(/[^.!?]+[.!?]?/g)?.map((part) => part.trim()).filter(Boolean) || [text];
    let compact = sentences.slice(0, maxSentences).join(' ').trim();
    const words = compact.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return compact;
    compact = words.slice(0, maxWords).join(' ').replace(/[.,;:!?-]*$/, '');
    return `${compact}...`;
  }

  function resolveElement(value) {
    if (!value) return null;
    if (value instanceof Element) return value;
    if (typeof value === 'string') return document.getElementById(value);
    return null;
  }

  function normalizeAxisScores(scores) {
    if (!scores || typeof scores !== 'object') return null;
    return {
      riskAggressive: clamp(scores.riskAggressive, 0, 100),
      controlInternal: clamp(scores.controlInternal, 0, 100),
      reactivityEmotional: clamp(scores.reactivityEmotional, 0, 100)
    };
  }

  function normalizeHighlights(items) {
    return (Array.isArray(items) ? items : [])
      .map((item) => ({
        label: expandShareText(item?.label),
        value: expandShareText(item?.value)
      }))
      .filter((item) => item.label && item.value)
      .slice(0, 4);
  }

  function normalizeSections(items) {
    return (Array.isArray(items) ? items : [])
      .map((item) => ({
        title: expandShareText(item?.title),
        items: (Array.isArray(item?.items) ? item.items : [])
          .map((entry) => expandShareText(entry))
          .filter(Boolean)
          .slice(0, 3)
      }))
      .filter((item) => item.title && item.items.length)
      .slice(0, 2);
  }

  function normalizeBestFit(bestFit, highlights, sections) {
    let title = expandShareText(bestFit?.title);
    let name = expandShareText(bestFit?.name || bestFit?.value || bestFit);
    let reason = expandShareText(bestFit?.reason || bestFit?.detail);

    if (!name) {
      const highlight =
        highlights.find((item) => /best[\s-]*fit|action|next|focus/i.test(item.label)) ||
        highlights.find((item) => /fit|move|plan/i.test(item.value)) ||
        highlights[0];
      if (highlight) {
        title = title || highlight.label;
        name = highlight.value;
      }
    }

    if (!reason) {
      const section =
        sections.find((item) => /fit|move|plan|action|next/i.test(item.title)) ||
        sections.find((item) => item.items.length > 1) ||
        sections[0];
      if (section) {
        title = title || section.title;
        reason = section.items.join(' ');
      }
    }

    if (!title) title = name ? 'Best Fit Investment' : 'Key Takeaway';
    if (reason && reason === name) reason = '';
    return {
      title,
      name,
      reason: shortenShareText(reason, { maxWords: 15, maxSentences: 1 })
    };
  }

  function normalizePayload(raw) {
    const payload = raw && typeof raw === 'object' ? raw : {};
    const highlights = normalizeHighlights(payload.highlights);
    const sections = normalizeSections(payload.sections);
    return {
      label: expandShareText(payload.label) || 'InvestoLab',
      eyebrow: expandShareText(payload.eyebrow) || 'InvestoType Result',
      title: expandShareText(payload.title),
      badge: expandShareText(payload.badge),
      summary: shortenShareText(payload.summary, { maxWords: 30, maxSentences: 2 }),
      axisScores: normalizeAxisScores(payload.axisScores),
      highlights,
      sections,
      bestFit: normalizeBestFit(payload.bestFit, highlights, sections),
      fileBase: asText(payload.fileBase) || 'investolab-investotype-result',
      link: asText(payload.link) || global.location.href
    };
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(Number(r || 0), Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function wrapTextLines(ctx, text, maxWidth) {
    const words = asText(text).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const lines = [];
    let current = '';
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (!current || ctx.measureText(next).width <= maxWidth) {
        current = next;
        continue;
      }
      lines.push(current);
      current = word;
    }
    if (current) lines.push(current);
    return lines;
  }

  function getWrappedLines(ctx, text, maxWidth, maxLines = 4) {
    const lines = wrapTextLines(ctx, text, maxWidth);
    if (lines.length <= maxLines) return lines;
    const capped = lines.slice(0, Math.max(1, maxLines));
    const last = capped[capped.length - 1];
    capped[capped.length - 1] = last.length > 2 ? `${last.replace(/[.,;:!?-]*$/, '')}...` : `${last}...`;
    return capped;
  }

  function fillWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
    const lines = getWrappedLines(ctx, text, maxWidth, maxLines);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight);
    });
    return lines.length;
  }

  function hexToRgb(hex) {
    const normalized = String(hex || '').trim().replace('#', '');
    const full = normalized.length === 3 ? normalized.split('').map((part) => `${part}${part}`).join('') : normalized;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 255, g: 255, b: 255 };
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16)
    };
  }

  function withAlpha(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
  }

  function resolveTextBlock(ctx, text, options = {}) {
    const maxWidth = Number(options.maxWidth || 200);
    const maxLines = Number(options.maxLines || 3);
    const startSize = Number(options.startSize || 48);
    const minSize = Number(options.minSize || 24);
    const weight = String(options.weight || '800');
    const family = options.family || 'Manrope, sans-serif';
    const step = Number(options.step || 2);
    const lineGap = Number(options.lineGap || 0.14);

    for (let size = startSize; size >= minSize; size -= step) {
      ctx.font = `${weight} ${size}px ${family}`;
      const rawLines = wrapTextLines(ctx, text, maxWidth);
      if (rawLines.length <= maxLines) {
        return {
          font: `${weight} ${size}px ${family}`,
          size,
          lineHeight: Math.round(size * (1 + lineGap)),
          lines: rawLines
        };
      }
    }

    ctx.font = `${weight} ${minSize}px ${family}`;
    return {
      font: `${weight} ${minSize}px ${family}`,
      size: minSize,
      lineHeight: Math.round(minSize * (1 + lineGap)),
      lines: getWrappedLines(ctx, text, maxWidth, maxLines)
    };
  }

  function measureTextBlockHeight(block) {
    return (block?.lines?.length || 0) * Number(block?.lineHeight || 0);
  }

  function resolveScaledLayout(buildLayout, availableHeight, options = {}) {
    const maxScale = Number(options.maxScale || 1);
    const minScale = Number(options.minScale || 0.7);
    const step = Number(options.step || 0.05);
    for (let scale = maxScale; scale >= minScale; scale -= step) {
      const layout = buildLayout(Number(scale.toFixed(3)));
      if (layout.height <= availableHeight) return layout;
    }
    return buildLayout(minScale);
  }

  function getCenteredContentTop(rectY, rectHeight, contentHeight, minInset = 0) {
    const safeHeight = Math.max(0, rectHeight - minInset * 2);
    const offset = Math.max(0, (safeHeight - contentHeight) / 2);
    return rectY + minInset + offset;
  }

  function getAxisRows(axisScores) {
    if (!axisScores || typeof axisScores !== 'object') return [];
    return [
      {
        key: 'risk',
        title: 'Risk Appetite',
        left: 'Conservative',
        right: 'Aggressive',
        value: clamp(axisScores.riskAggressive, 0, 100),
        color: '#2563eb'
      },
      {
        key: 'control',
        title: 'Control Preference',
        left: 'Passive',
        right: 'Active',
        value: clamp(axisScores.controlInternal, 0, 100),
        color: '#0f766e'
      },
      {
        key: 'reactivity',
        title: 'Emotional Reactivity',
        left: 'Rational',
        right: 'Emotional',
        value: clamp(axisScores.reactivityEmotional, 0, 100),
        color: '#ea580c'
      }
    ];
  }

  function getAxisTilt(axis) {
    if (!axis) return 'Balanced';
    return Math.abs(axis.value - 50) < 7 ? 'Balanced' : axis.value >= 50 ? axis.right : axis.left;
  }

  function getDominantAxis(axisRows) {
    if (!axisRows.length) return null;
    return axisRows.reduce((best, axis) => {
      const bestDelta = Math.abs((best?.value ?? 50) - 50);
      const axisDelta = Math.abs(axis.value - 50);
      return axisDelta > bestDelta ? axis : best;
    }, axisRows[0]);
  }

  function getAxisLead(axis) {
    return axis ? `${getAxisTilt(axis)} ${axis.title}` : 'Balanced profile';
  }

  function getAxisPointDescriptor(axis) {
    if (!axis) return { label: 'Balanced', value: 50 };
    const highValue = clamp(axis.value, 0, 100);
    const lowValue = 100 - highValue;
    return highValue >= 50
      ? { label: axis.right, value: Math.round(highValue) }
      : { label: axis.left, value: Math.round(lowValue) };
  }

  function rotate3D(point, rxDeg, ryDeg) {
    const rx = (rxDeg * Math.PI) / 180;
    const ry = (ryDeg * Math.PI) / 180;
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const y1 = point.y * cosX - point.z * sinX;
    const z1 = point.y * sinX + point.z * cosX;
    const x2 = point.x * cosY + z1 * sinY;
    const z2 = -point.x * sinY + z1 * cosY;
    return { x: x2, y: y1, z: z2 };
  }

  function triangleArea(a, b, c) {
    return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function chooseNebulaView(axisRows, area) {
    const scores = {
      aggressive: axisRows[0]?.value ?? 50,
      internal: axisRows[1]?.value ?? 50,
      emotional: axisRows[2]?.value ?? 50
    };
    const candidates = [
      { rotX: -26, rotY: 34 },
      { rotX: -18, rotY: 48 },
      { rotX: -34, rotY: 20 },
      { rotX: 10, rotY: 38 },
      { rotX: 18, rotY: 24 },
      { rotX: -12, rotY: -48 },
      { rotX: -26, rotY: -30 },
      { rotX: 14, rotY: -36 },
      { rotX: 28, rotY: -18 },
      { rotX: -8, rotY: 58 }
    ];
    const dominantAxis = getDominantAxis(axisRows);
    const dominantPoint =
      dominantAxis?.key === 'risk'
        ? { x: scores.aggressive / 50 - 1, y: 0, z: 0 }
        : dominantAxis?.key === 'control'
        ? { x: 0, y: scores.internal / 50 - 1, z: 0 }
        : { x: 0, y: 0, z: scores.emotional / 50 - 1 };
    const unit = Math.min(area.w, area.h) * 0.25;
    const perspective = unit * 3.8;

    const project = (point, rotX, rotY) => {
      const rotated = rotate3D(point, rotX, rotY);
      const scale = perspective / (perspective + rotated.z * unit);
      return {
        x: area.x + area.w / 2 + rotated.x * unit * scale,
        y: area.y + area.h / 2 - rotated.y * unit * scale,
        z: rotated.z
      };
    };

    return candidates.reduce((best, candidate) => {
      const riskPoint = project({ x: scores.aggressive / 50 - 1, y: 0, z: 0 }, candidate.rotX, candidate.rotY);
      const controlPoint = project({ x: 0, y: scores.internal / 50 - 1, z: 0 }, candidate.rotX, candidate.rotY);
      const reactPoint = project({ x: 0, y: 0, z: scores.emotional / 50 - 1 }, candidate.rotX, candidate.rotY);
      const areaScore = triangleArea(riskPoint, controlPoint, reactPoint);
      const spreadScore = Math.min(distance(riskPoint, controlPoint), distance(controlPoint, reactPoint), distance(riskPoint, reactPoint));
      const dominantDepth = rotate3D(dominantPoint, candidate.rotX, candidate.rotY).z;
      const score = areaScore + spreadScore * 58 + Math.max(0, -dominantDepth) * 1400;
      if (!best || score > best.score) return { ...candidate, score };
      return best;
    }, null);
  }

  function getStageLabelRect(point, width, height, gap, placement) {
    if (placement === 'left') {
      return { x: point.x - width - gap, y: point.y - height / 2, w: width, h: height };
    }
    if (placement === 'right') {
      return { x: point.x + gap, y: point.y - height / 2, w: width, h: height };
    }
    if (placement === 'top') {
      return { x: point.x - width / 2, y: point.y - height - gap, w: width, h: height };
    }
    if (placement === 'bottom') {
      return { x: point.x - width / 2, y: point.y + gap, w: width, h: height };
    }
    if (placement === 'top-left') {
      return { x: point.x - width - gap, y: point.y - height - gap, w: width, h: height };
    }
    if (placement === 'top-right') {
      return { x: point.x + gap, y: point.y - height - gap, w: width, h: height };
    }
    if (placement === 'bottom-left') {
      return { x: point.x - width - gap, y: point.y + gap, w: width, h: height };
    }
    return { x: point.x + gap, y: point.y + gap, w: width, h: height };
  }

  function getRectOverlapArea(a, b) {
    const overlapWidth = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const overlapHeight = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    return overlapWidth * overlapHeight;
  }

  function drawStagePillLabel(ctx, stageRect, text, p, fg = '#0f172a', bg = 'rgba(255,255,255,0.92)', border = 'rgba(148,163,184,0.45)', options = {}) {
    const fontScale = clamp(Number(options.fontScale || 1), 0.72, 1.2);
    const padX = Math.max(5, Math.round(6 * fontScale));
    const padY = Math.max(3, Math.round(4 * fontScale));
    const placements =
      Array.isArray(options.placements) && options.placements.length
        ? options.placements
        : p.x >= stageRect.x + stageRect.w / 2
        ? ['right', 'top-right', 'bottom-right', 'top', 'bottom', 'left']
        : ['left', 'top-left', 'bottom-left', 'top', 'bottom', 'right'];
    const placedRects = Array.isArray(options.placedRects) ? options.placedRects : [];
    const pointRadius = Number(options.pointRadius || 0);
    const gap = Number(options.gap || 6) + pointRadius;
    const clampPadding = Number(options.clampPadding || 8);
    ctx.save();
    const fontSize = Math.max(8, Math.floor(stageRect.w * 0.026 * fontScale));
    ctx.font = `${fontSize}px ui-sans-serif, system-ui`;
    const tw = ctx.measureText(text).width;
    const bw = tw + padX * 2;
    const bh = Math.max(15, Math.round(fontSize + padY * 2.1));
    const minX = stageRect.x + clampPadding;
    const maxX = stageRect.x + stageRect.w - clampPadding - bw;
    const minY = stageRect.y + clampPadding;
    const maxY = stageRect.y + stageRect.h - clampPadding - bh;

    const best = placements.reduce((winner, placement, index) => {
      const desired = getStageLabelRect(p, bw, bh, gap, placement);
      const rect = {
        x: clamp(desired.x, minX, maxX),
        y: clamp(desired.y, minY, maxY),
        w: bw,
        h: bh
      };
      const overlapPenalty = placedRects.reduce((sum, existing) => sum + getRectOverlapArea(rect, existing), 0) * 12;
      const pointInsidePenalty =
        p.x >= rect.x - 2 && p.x <= rect.x + rect.w + 2 && p.y >= rect.y - 2 && p.y <= rect.y + rect.h + 2 ? 9000 : 0;
      const shiftPenalty = Math.hypot(rect.x - desired.x, rect.y - desired.y) * 6;
      const preferencePenalty = index * 22;
      const score = overlapPenalty + pointInsidePenalty + shiftPenalty + preferencePenalty;
      if (!winner || score < winner.score) return { rect, score };
      return winner;
    }, null);
    const x = best?.rect.x ?? minX;
    const y = best?.rect.y ?? minY;

    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, x, y, bw, bh, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX, y + bh / 2 + 0.5);
    ctx.restore();
    if (best?.rect && Array.isArray(options.placedRects)) options.placedRects.push(best.rect);
    return best?.rect || { x, y, w: bw, h: bh };
  }

  function drawEndPageStyleNebulaStage(ctx, stageRect, axisRows, options = {}) {
    const labelScale = clamp(Number(options.labelScale || 1), 0.72, 1.2);
    const placedLabelRects = [];
    ctx.save();
    drawRoundedRect(ctx, stageRect.x, stageRect.y, stageRect.w, stageRect.h, 14);
    ctx.clip();

    const bg = ctx.createLinearGradient(stageRect.x, stageRect.y, stageRect.x, stageRect.y + stageRect.h);
    bg.addColorStop(0, '#f8fbff');
    bg.addColorStop(1, '#edf3ff');
    ctx.fillStyle = bg;
    ctx.fillRect(stageRect.x, stageRect.y, stageRect.w, stageRect.h);

    const cx = stageRect.x + stageRect.w / 2;
    const cy = stageRect.y + stageRect.h / 2;
    const unit = Math.min(stageRect.w, stageRect.h) * 0.23;

    const nebula = ctx.createRadialGradient(cx - unit * 0.35, cy - unit * 0.42, 12, cx, cy, unit * 2);
    nebula.addColorStop(0, 'rgba(59,130,246,0.18)');
    nebula.addColorStop(0.5, 'rgba(14,165,233,0.08)');
    nebula.addColorStop(1, 'rgba(14,165,233,0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(stageRect.x, stageRect.y, stageRect.w, stageRect.h);

    const flareA = ctx.createRadialGradient(stageRect.x + stageRect.w * 0.2, stageRect.y + stageRect.h * 0.14, 0, stageRect.x + stageRect.w * 0.2, stageRect.y + stageRect.h * 0.14, stageRect.w * 0.42);
    flareA.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
    flareA.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = flareA;
    ctx.fillRect(stageRect.x, stageRect.y, stageRect.w, stageRect.h);

    const flareB = ctx.createRadialGradient(stageRect.x + stageRect.w * 0.82, stageRect.y + stageRect.h * 0.82, 0, stageRect.x + stageRect.w * 0.82, stageRect.y + stageRect.h * 0.82, stageRect.w * 0.4);
    flareB.addColorStop(0, 'rgba(37, 99, 235, 0.14)');
    flareB.addColorStop(1, 'rgba(37, 99, 235, 0)');
    ctx.fillStyle = flareB;
    ctx.fillRect(stageRect.x, stageRect.y, stageRect.w, stageRect.h);

    for (let i = 0; i < 32; i += 1) {
      const sx = ((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1 + 1) % 1;
      const sy = ((Math.sin((i + 1) * 78.233) * 12345.6789) % 1 + 1) % 1;
      const r = 0.5 + ((Math.sin((i + 1) * 4.17) + 1) * 0.5) * 1.4;
      ctx.fillStyle = 'rgba(148,163,184,0.22)';
      ctx.beginPath();
      ctx.arc(stageRect.x + sx * stageRect.w, stageRect.y + sy * stageRect.h, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const perspective = unit * 3.4;
    const rotX = -22;
    const rotY = 28;
    const transform = (p) => {
      const r = rotate3D(p, rotX, rotY);
      const s = perspective / (perspective + r.z * unit);
      return { x: cx + r.x * unit * s, y: cy - r.y * unit * s, z: r.z };
    };
    const drawSegment = (a, b, color, width = 1, alpha = 1, dash = null, glow = 0) => {
      const p1 = transform(a);
      const p2 = transform(b);
      ctx.save();
      if (dash) ctx.setLineDash(dash);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      if (glow > 0) {
        ctx.shadowBlur = glow;
        ctx.shadowColor = color;
      }
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
      return { p1, p2 };
    };
    const drawArrow = (from, to, color) => {
      const seg = drawSegment(from, to, color, 2.5, 0.92, null, 8);
      const a = Math.atan2(seg.p2.y - seg.p1.y, seg.p2.x - seg.p1.x);
      const len = Math.max(6, Math.min(11, stageRect.w * 0.026));
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(seg.p2.x, seg.p2.y);
      ctx.lineTo(seg.p2.x - len * Math.cos(a - 0.35), seg.p2.y - len * Math.sin(a - 0.35));
      ctx.lineTo(seg.p2.x - len * Math.cos(a + 0.35), seg.p2.y - len * Math.sin(a + 0.35));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    for (const t of [-0.6, -0.3, 0, 0.3, 0.6]) {
      drawSegment({ x: -1, y: t, z: -1 }, { x: 1, y: t, z: -1 }, '#c7d2fe', 1, 0.24, [3, 4]);
      drawSegment({ x: t, y: -1, z: -1 }, { x: t, y: 1, z: -1 }, '#c7d2fe', 1, 0.24, [3, 4]);
      drawSegment({ x: -1, y: -1, z: t }, { x: 1, y: -1, z: t }, '#cbd5e1', 1, 0.18, [2, 5]);
    }

    const cubePts = [
      { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
    ];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    edges.forEach(([a, b]) => {
      const za = rotate3D(cubePts[a], rotX, rotY).z;
      const zb = rotate3D(cubePts[b], rotX, rotY).z;
      const depthAlpha = 0.24 + ((za + zb + 2) / 4) * 0.32;
      drawSegment(cubePts[a], cubePts[b], '#64748b', 1.2, depthAlpha);
    });

    drawArrow({ x: -1.22, y: 0, z: 0 }, { x: 1.22, y: 0, z: 0 }, '#2563eb');
    drawArrow({ x: 0, y: -1.22, z: 0 }, { x: 0, y: 1.22, z: 0 }, '#0f766e');
    drawArrow({ x: 0, y: 0, z: -1.22 }, { x: 0, y: 0, z: 1.22 }, '#dc2626');

    const endpointLabels = [
      { p: { x: 1.29, y: 0, z: 0 }, t: 'Aggressive', c: '#1d4ed8', placements: ['right', 'top-right', 'bottom-right'] },
      { p: { x: -1.29, y: 0, z: 0 }, t: 'Conservative', c: '#1d4ed8', placements: ['left', 'top-left', 'bottom-left'] },
      { p: { x: 0, y: 1.29, z: 0 }, t: 'Active', c: '#0f766e', placements: ['top', 'top-right', 'top-left'] },
      { p: { x: 0, y: -1.29, z: 0 }, t: 'Passive', c: '#0f766e', placements: ['bottom', 'bottom-right', 'bottom-left'] },
      { p: { x: 0, y: 0, z: 1.29 }, t: 'Emotional', c: '#dc2626', placements: ['top-right', 'right', 'bottom-right'] },
      { p: { x: 0, y: 0, z: -1.29 }, t: 'Rational', c: '#dc2626', placements: ['bottom-left', 'left', 'top-left'] }
    ];
    endpointLabels.forEach((item) => {
      drawStagePillLabel(ctx, stageRect, item.t, transform(item.p), item.c, 'rgba(255,255,255,0.9)', 'rgba(203,213,225,0.8)', {
        fontScale: labelScale,
        placements: item.placements,
        placedRects: placedLabelRects,
        pointRadius: 3,
        gap: 8,
        clampPadding: 10
      });
    });

    cubePts
      .map((c) => {
        const p = transform(c);
        return { x: p.x, y: p.y, z: p.z };
      })
      .sort((a, b) => a.z - b.z)
      .forEach((c) => {
        const radius = Math.max(2.4, Math.min(5.5, stageRect.w * 0.012 + c.z * 0.9));
        ctx.fillStyle = `rgba(100,116,139,${0.4 + (c.z + 1) * 0.15})`;
        ctx.strokeStyle = 'rgba(255,255,255,0.78)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

    const scores = {
      aggressive: axisRows[0]?.value ?? 50,
      internal: axisRows[1]?.value ?? 50,
      emotional: axisRows[2]?.value ?? 50
    };
    const pr = { x: scores.aggressive / 50 - 1, y: 0, z: 0 };
    const pc = { x: 0, y: scores.internal / 50 - 1, z: 0 };
    const pe = { x: 0, y: 0, z: scores.emotional / 50 - 1 };
    const rr = transform(pr);
    const rc = transform(pc);
    const re = transform(pe);

    const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, unit * 1.2);
    glow.addColorStop(0, 'rgba(56,189,248,0.2)');
    glow.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.moveTo(rr.x, rr.y);
    ctx.lineTo(rc.x, rc.y);
    ctx.lineTo(re.x, re.y);
    ctx.closePath();
    ctx.fill();

    const profileFill = ctx.createLinearGradient(rr.x, rr.y, re.x, re.y);
    profileFill.addColorStop(0, 'rgba(37,99,235,0.24)');
    profileFill.addColorStop(0.5, 'rgba(15,118,110,0.18)');
    profileFill.addColorStop(1, 'rgba(220,38,38,0.24)');
    ctx.fillStyle = profileFill;
    ctx.beginPath();
    ctx.moveTo(rr.x, rr.y);
    ctx.lineTo(rc.x, rc.y);
    ctx.lineTo(re.x, re.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(30,64,175,0.9)';
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(59,130,246,0.34)';
    ctx.beginPath();
    ctx.moveTo(rr.x, rr.y);
    ctx.lineTo(rc.x, rc.y);
    ctx.lineTo(re.x, re.y);
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    [rr, rc, re].forEach((p) => {
      ctx.strokeStyle = 'rgba(148,163,184,0.36)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    const riskPointLabel = getAxisPointDescriptor(axisRows[0]);
    const controlPointLabel = getAxisPointDescriptor(axisRows[1]);
    const reactPointLabel = getAxisPointDescriptor(axisRows[2]);
    [
      { p: rr, c: '#2563eb', t: `${riskPointLabel.label} ${riskPointLabel.value}%`, placements: ['bottom-right', 'right', 'top-right', 'bottom', 'top'] },
      { p: rc, c: '#0f766e', t: `${controlPointLabel.label} ${controlPointLabel.value}%`, placements: ['top-left', 'top', 'top-right', 'left', 'right'] },
      { p: re, c: '#dc2626', t: `${reactPointLabel.label} ${reactPointLabel.value}%`, placements: ['bottom-right', 'right', 'top-right', 'bottom', 'top'] }
    ].forEach((n) => {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = n.c;
      ctx.fillStyle = n.c;
      ctx.beginPath();
      ctx.arc(n.p.x, n.p.y, Math.max(4.5, Math.min(7.2, stageRect.w * 0.018)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawStagePillLabel(ctx, stageRect, n.t, n.p, '#0f172a', 'rgba(255,255,255,0.95)', 'rgba(148,163,184,0.65)', {
        fontScale: labelScale,
        placements: n.placements,
        placedRects: placedLabelRects,
        pointRadius: Math.max(4.5, Math.min(7.2, stageRect.w * 0.018)),
        gap: labelScale < 0.9 ? 6 : 8,
        clampPadding: 10
      });
    });

    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, stageRect.x, stageRect.y, stageRect.w, stageRect.h, 14);
    ctx.strokeStyle = '#dbe7ff';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  function fillTextBlock(ctx, block, x, y, color, align = 'left') {
    ctx.save();
    ctx.font = block.font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    block.lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * block.lineHeight);
    });
    ctx.restore();
    return block.lines.length * block.lineHeight;
  }

  function drawGlassPanel(ctx, x, y, width, height, options = {}) {
    const radius = Number(options.radius || 28);
    const fill = options.fill || 'rgba(255, 255, 255, 0.84)';
    const stroke = options.stroke || 'rgba(255, 255, 255, 0.92)';
    const lineWidth = Number(options.lineWidth || 1.5);

    ctx.save();
    drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = fill;
    if (Number(options.shadowBlur || 0) > 0) {
      ctx.shadowBlur = Number(options.shadowBlur || 0);
      ctx.shadowColor = options.shadowColor || 'rgba(15, 23, 42, 0.12)';
      ctx.shadowOffsetY = Number(options.shadowOffsetY || 18);
    }
    ctx.fill();
    ctx.restore();

    if (options.tint) {
      ctx.save();
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.clip();
      const tintGradient = ctx.createLinearGradient(x, y, x + width, y + height);
      tintGradient.addColorStop(0, withAlpha(options.tint, 0.12));
      tintGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = tintGradient;
      ctx.fillRect(x, y, width, height);
      ctx.restore();
    }

    ctx.save();
    drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  function drawPill(ctx, text, x, y, options = {}) {
    const label = asText(text);
    if (!label) return 0;
    const font = options.font || '700 18px Manrope, sans-serif';
    const padX = Number(options.padX || 16);
    const bg = options.bg || 'rgba(255, 255, 255, 0.9)';
    const fg = options.fg || '#0f172a';
    const stroke = options.stroke || 'rgba(37, 99, 235, 0.12)';
    const height = Number(options.height || 34);

    ctx.save();
    ctx.font = font;
    const width = ctx.measureText(label).width + padX * 2;
    drawRoundedRect(ctx, x, y, width, height, 999);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Number(options.lineWidth || 1.2);
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + padX, y + height / 2);
    ctx.restore();
    return width;
  }

  function drawBackdrop(ctx, width, height, accent, isPortrait) {
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, '#f7fbff');
    background.addColorStop(0.5, '#eef4ff');
    background.addColorStop(1, '#fff8ef');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    [
      { x: width * 0.14, y: height * 0.16, r: height * 0.24, color: accent, alpha: 0.12 },
      { x: width * 0.85, y: height * 0.22, r: height * 0.18, color: '#14b8a6', alpha: 0.08 },
      { x: width * 0.72, y: height * 0.8, r: height * 0.22, color: '#fb923c', alpha: 0.1 }
    ].forEach((glow) => {
      const fill = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.r);
      fill.addColorStop(0, withAlpha(glow.color, glow.alpha));
      fill.addColorStop(1, withAlpha(glow.color, 0));
      ctx.fillStyle = fill;
      ctx.fillRect(glow.x - glow.r, glow.y - glow.r, glow.r * 2, glow.r * 2);
    });

    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    const gap = isPortrait ? 96 : 90;
    for (let x = -height; x < width + height; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    [0.14, 0.45, 0.78].forEach((ratio) => {
      ctx.beginPath();
      ctx.arc(width * 0.5, height * ratio, Math.min(width, height) * (isPortrait ? 0.44 : 0.38), Math.PI * 0.06, Math.PI * 0.94);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawMeter(ctx, x, y, width, height, axis) {
    const radius = height / 2;
    drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.fill();

    const fillWidth = Math.max(height, (width * clamp(axis.value, 0, 100)) / 100);
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, withAlpha(axis.color, 0.34));
    gradient.addColorStop(1, axis.color);
    drawRoundedRect(ctx, x, y, fillWidth, height, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    const midX = x + width / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, y - 4);
    ctx.lineTo(midX, y + height + 4);
    ctx.stroke();
    ctx.restore();

    const dotX = x + (width * clamp(axis.value, 0, 100)) / 100;
    ctx.beginPath();
    ctx.arc(dotX, y + height / 2, height * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = axis.color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function getAxisDetailHeading(axis) {
    const tilt = getAxisTilt(axis);
    if (tilt === 'Balanced') return `Near balance at ${Math.round(axis.value)}%`;
    return `${tilt} at ${Math.round(axis.value)}%`;
  }

  function getAxisInsight(axis) {
    if (!axis) return '';
    if (axis.key === 'risk') {
      if (axis.value >= 64) return 'Comfortable with bigger swings for upside.';
      if (axis.value >= 54) return 'Leans toward upside, with some caution.';
      if (axis.value <= 36) return 'Protects capital before chasing upside.';
      if (axis.value <= 46) return 'Defensive by default, but still selective.';
      return 'Balances upside with downside control.';
    }
    if (axis.key === 'control') {
      if (axis.value >= 64) return 'Prefers hands-on, self-directed decisions.';
      if (axis.value >= 54) return 'Leans active, with some structure.';
      if (axis.value <= 36) return 'Prefers simple systems and less intervention.';
      if (axis.value <= 46) return 'Leans passive, with selective input.';
      return 'Balances active choices with passive structure.';
    }
    if (axis.value >= 64) return 'Volatility is more likely to drive reactions.';
    if (axis.value >= 54) return 'Emotion matters, but does not fully lead.';
    if (axis.value <= 36) return 'Stays analytical and process-driven under stress.';
    if (axis.value <= 46) return 'Mostly analytical, with some sensitivity.';
    return 'Blends process discipline with emotional response.';
  }

  function drawAxisDetailCard(ctx, axis, rect, isPortrait) {
    drawGlassPanel(ctx, rect.x, rect.y, rect.w, rect.h, {
      radius: 26,
      tint: axis.color,
      fill: 'rgba(255, 255, 255, 0.72)',
      stroke: 'rgba(255, 255, 255, 0.88)',
      shadowBlur: 12,
      shadowOffsetY: 10
    });

    const padX = isPortrait ? 24 : 18;
    const padY = isPortrait ? 22 : 18;
    const innerWidth = rect.w - padX * 2;
    const availableHeight = rect.h - padY * 2;
    const layout = resolveScaledLayout(
      (scale) => {
        const titleFontSize = Math.max(isPortrait ? 19 : 17, Math.round((isPortrait ? 26 : 24) * scale));
        const subFontSize = Math.max(isPortrait ? 16 : 15, Math.round((isPortrait ? 21 : 19) * scale));
        const labelFontSize = Math.max(13, Math.round((isPortrait ? 17 : 15) * scale));
        const meterHeight = Math.max(9, Math.round((isPortrait ? 12 : 11) * scale));
        const insightBlock = resolveTextBlock(ctx, getAxisInsight(axis), {
          maxWidth: innerWidth,
          maxLines: 2,
          startSize: Math.max(16, Math.round((isPortrait ? 20 : 19) * scale)),
          minSize: 14,
          weight: '700',
          lineGap: 0.28
        });
        const titleHeight = titleFontSize;
        const subHeight = subFontSize;
        const labelHeight = labelFontSize;
        const insightHeight = measureTextBlockHeight(insightBlock);
        const contentHeight = titleHeight + subHeight + meterHeight + labelHeight + insightHeight;
        const freeSpace = Math.max(0, availableHeight - contentHeight);
        const gapUnit = freeSpace / 4;
        const gapA = Math.max(isPortrait ? 12 : 10, Math.min(isPortrait ? 20 : 18, Math.round(gapUnit * 0.9)));
        const gapB = Math.max(isPortrait ? 14 : 12, Math.min(isPortrait ? 24 : 20, Math.round(gapUnit * 1.15)));
        const gapC = Math.max(isPortrait ? 11 : 9, Math.min(isPortrait ? 18 : 16, Math.round(gapUnit * 0.78)));
        const gapD = Math.max(isPortrait ? 14 : 12, Math.min(isPortrait ? 24 : 20, Math.round(gapUnit * 1.17)));
        const height = contentHeight + gapA + gapB + gapC + gapD;
        return {
          titleFontSize,
          subFontSize,
          labelFontSize,
          meterHeight,
          titleHeight,
          subHeight,
          labelHeight,
          gapA,
          gapB,
          gapC,
          gapD,
          insightBlock,
          height
        };
      },
      availableHeight,
      { minScale: 0.72, step: 0.04 }
    );
    const top = getCenteredContentTop(rect.y, rect.h, layout.height, padY);

    ctx.save();
    drawRoundedRect(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 24);
    ctx.clip();
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#081120';
    ctx.font = `700 ${layout.titleFontSize}px Manrope, sans-serif`;
    let cursorY = top;
    ctx.fillText(axis.title, rect.x + padX, cursorY);
    cursorY += layout.titleHeight + layout.gapA;

    ctx.fillStyle = '#3d4e61';
    ctx.font = `700 ${layout.subFontSize}px Manrope, sans-serif`;
    ctx.fillText(getAxisDetailHeading(axis), rect.x + padX, cursorY);
    cursorY += layout.subHeight + layout.gapB;

    drawMeter(ctx, rect.x + padX, cursorY, innerWidth, layout.meterHeight, axis);
    cursorY += layout.meterHeight + layout.gapC;

    ctx.fillStyle = '#64748b';
    ctx.font = `600 ${layout.labelFontSize}px Manrope, sans-serif`;
    ctx.fillText(axis.left, rect.x + padX, cursorY);
    const rightWidth = ctx.measureText(axis.right).width;
    ctx.fillText(axis.right, rect.x + rect.w - padX - rightWidth, cursorY);
    cursorY += layout.labelHeight + layout.gapD;

    fillTextBlock(ctx, layout.insightBlock, rect.x + padX, cursorY, '#334155');
    ctx.restore();
  }

  function drawLegendCard(ctx, axis, rect) {
    drawGlassPanel(ctx, rect.x, rect.y, rect.w, rect.h, {
      radius: 22,
      tint: axis.color,
      fill: 'rgba(255, 255, 255, 0.7)',
      stroke: 'rgba(255, 255, 255, 0.82)'
    });

    ctx.save();
    ctx.textBaseline = 'top';
    const titleBlock = resolveTextBlock(ctx, axis.title, {
      maxWidth: rect.w - 48,
      maxLines: 2,
      startSize: 14,
      minSize: 12,
      weight: '700',
      lineGap: 0.12
    });
    const contentHeight = 6 + 10 + measureTextBlockHeight(titleBlock) + 10 + 14;
    const top = getCenteredContentTop(rect.y, rect.h, contentHeight, 10);
    ctx.beginPath();
    ctx.arc(rect.x + 20, top + 6, 6, 0, Math.PI * 2);
    ctx.fillStyle = axis.color;
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    fillTextBlock(ctx, titleBlock, rect.x + 34, top + 4, '#0f172a');
    ctx.fillStyle = '#64748b';
    ctx.font = '600 14px Manrope, sans-serif';
    ctx.fillText(getAxisTilt(axis), rect.x + 20, top + contentHeight - 4);
    ctx.restore();
  }

  function drawNebulaWidget(ctx, rect, axisRows, accent, isPortrait) {
    const radius = isPortrait ? 34 : 30;
    const padX = isPortrait ? 34 : 30;
    const padY = isPortrait ? 30 : 26;
    const innerX = rect.x + padX;
    const innerY = rect.y + padY;
    const innerW = rect.w - padX * 2;
    const innerBottom = rect.y + rect.h - padY;
    const titleSize = isPortrait ? 34 : 30;
    const explainer = 'A 3D view of your three investing axes.';
    const explainerSize = isPortrait ? 16 : 14;
    const titleGap = isPortrait ? 4 : 3;
    const stageGap = isPortrait ? 8 : 6;
    const explainerY = innerY + titleSize + titleGap;
    const stageTop = explainerY + explainerSize + stageGap;

    ctx.save();
    drawRoundedRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 16;
    ctx.shadowColor = 'rgba(30, 64, 175, 0.08)';
    const panelFill = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    panelFill.addColorStop(0, '#fbfdff');
    panelFill.addColorStop(1, '#f7faff');
    ctx.fillStyle = panelFill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
    ctx.clip();
    const tint = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    tint.addColorStop(0, withAlpha(accent, 0.08));
    tint.addColorStop(0.42, 'rgba(255, 255, 255, 0)');
    tint.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();

    ctx.save();
    drawRoundedRect(ctx, rect.x, rect.y, rect.w, rect.h, radius);
    ctx.strokeStyle = '#e6edf8';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    const stageRect = {
      x: innerX,
      y: stageTop,
      w: innerW,
      h: Math.max(220, innerBottom - stageTop)
    };

    ctx.save();
    drawRoundedRect(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, radius - 2);
    ctx.clip();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#081120';
    ctx.font = `800 ${titleSize}px Manrope, sans-serif`;
    ctx.fillText('Score Nebula', innerX, innerY);
    ctx.fillStyle = '#64748b';
    ctx.font = `600 ${explainerSize}px Manrope, sans-serif`;
    ctx.fillText(explainer, innerX, explainerY);

    drawEndPageStyleNebulaStage(ctx, stageRect, axisRows, {
      labelScale: isPortrait ? 0.86 : 1.02
    });
    ctx.restore();
  }

  function drawTypeCard(ctx, rect, payload, accent, dominantAxis, isPortrait) {
    drawGlassPanel(ctx, rect.x, rect.y, rect.w, rect.h, {
      radius: 34,
      tint: accent,
      fill: 'rgba(255, 255, 255, 0.84)',
      stroke: 'rgba(255, 255, 255, 0.92)',
      shadowBlur: 24,
      shadowOffsetY: 18
    });

    const pad = isPortrait ? 32 : 28;
    const innerWidth = rect.w - pad * 2;
    const pillHeight = isPortrait ? 40 : 36;
    const availableHeight = rect.h - pad * 2;
    const isQuizResult = /quiz/i.test(asText(payload.eyebrow));
    const mixText = payload.badge ? `Axis mix: ${payload.badge}` : `Strongest tilt: ${getAxisLead(dominantAxis)}`;
    const layout = resolveScaledLayout(
      (scale) => {
        const titleBlock = resolveTextBlock(ctx, payload.title || 'Investor Analysis', {
          maxWidth: innerWidth,
          maxLines: scale < 0.82 ? 1 : 2,
          startSize: Math.max(26, Math.round((isPortrait ? 58 : 48) * scale)),
          minSize: isPortrait ? 26 : 22,
          weight: '800',
          lineGap: 0.1
        });
        const mixBlock = resolveTextBlock(ctx, mixText, {
          maxWidth: innerWidth,
          maxLines: scale < 0.82 ? 2 : 1,
          startSize: Math.max(14, Math.round((isPortrait ? 22 : 19) * scale)),
          minSize: 13,
          weight: '700',
          lineGap: 0.22
        });
        const summaryBlock = resolveTextBlock(ctx, payload.summary || 'Your share image will appear here once a result is available.', {
          maxWidth: innerWidth,
          maxLines: isPortrait ? 4 : 3,
          startSize: Math.max(isQuizResult ? 18 : 17, Math.round((isPortrait ? (isQuizResult ? 29 : 27) : isQuizResult ? 26 : 24) * scale)),
          minSize: isQuizResult ? 16 : 15,
          weight: '700',
          lineGap: 0.22
        });
        const gapAfterPill = Math.max(12, Math.round((isPortrait ? 18 : 14) * scale));
        const gapAfterTitle = Math.max(7, Math.round(10 * scale));
        const gapAfterMix = Math.max(6, Math.round(8 * scale));
        return {
          titleBlock,
          mixBlock,
          summaryBlock,
          gapAfterPill,
          gapAfterTitle,
          gapAfterMix,
          height:
            pillHeight +
            gapAfterPill +
            measureTextBlockHeight(titleBlock) +
            gapAfterTitle +
            measureTextBlockHeight(mixBlock) +
            gapAfterMix +
            measureTextBlockHeight(summaryBlock)
        };
      },
      availableHeight,
      { minScale: 0.68, step: 0.04 }
    );
    let cursorY = getCenteredContentTop(rect.y, rect.h, layout.height, pad);

    ctx.save();
    drawRoundedRect(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 32);
    ctx.clip();
    drawPill(ctx, payload.eyebrow || 'InvestoType Result', rect.x + pad, cursorY, {
      font: isPortrait ? '700 20px Manrope, sans-serif' : '700 18px Manrope, sans-serif',
      bg: 'rgba(255, 255, 255, 0.94)',
      fg: '#0f172a',
      stroke: withAlpha(accent, 0.18),
      height: pillHeight,
      padX: 17
    });
    cursorY += pillHeight + layout.gapAfterPill;
    fillTextBlock(ctx, layout.titleBlock, rect.x + pad, cursorY, '#081120');
    cursorY += measureTextBlockHeight(layout.titleBlock) + layout.gapAfterTitle;
    fillTextBlock(ctx, layout.mixBlock, rect.x + pad, cursorY, withAlpha(accent, 0.96));
    cursorY += measureTextBlockHeight(layout.mixBlock) + layout.gapAfterMix;
    fillTextBlock(ctx, layout.summaryBlock, rect.x + pad, cursorY, '#1f2937');
    ctx.restore();
  }

  function drawSupportCard(ctx, rect, payload, accent, isPortrait) {
    drawGlassPanel(ctx, rect.x, rect.y, rect.w, rect.h, {
      radius: 32,
      tint: '#fb923c',
      fill: 'rgba(255, 255, 255, 0.82)',
      stroke: 'rgba(255, 255, 255, 0.9)',
      shadowBlur: 20,
      shadowOffsetY: 16
    });

    const cardTitle = payload.bestFit?.title || 'Best Fit Investment';
    const cardName = payload.bestFit?.name || payload.highlights?.[0]?.value || payload.title || 'Insight pending';
    const cardReason =
      payload.bestFit?.reason ||
      payload.sections?.[0]?.items?.join(' ') ||
      payload.highlights?.[1]?.value ||
      payload.summary;
    const pad = isPortrait ? 30 : 24;
    const availableHeight = rect.h - pad * 2;
    const titleLineHeight = isPortrait ? 20 : 18;
    const layout = resolveScaledLayout(
      (scale) => {
        const nameBlock = resolveTextBlock(ctx, cardName, {
          maxWidth: rect.w - pad * 2,
          maxLines: scale < 0.8 ? 2 : 3,
          startSize: Math.max(20, Math.round((isPortrait ? 40 : 32) * scale)),
          minSize: isPortrait ? 22 : 18,
          weight: '800',
          lineGap: 0.12
        });
        const reasonBlock = resolveTextBlock(ctx, cardReason, {
          maxWidth: rect.w - pad * 2,
          maxLines: 2,
          startSize: Math.max(14, Math.round((isPortrait ? 22 : 19) * scale)),
          minSize: 12,
          weight: '700',
          lineGap: 0.28
        });
        const gapAfterTitle = Math.max(10, Math.round((isPortrait ? 14 : 12) * scale));
        const gapAfterName = Math.max(7, Math.round(10 * scale));
        return {
          nameBlock,
          reasonBlock,
          gapAfterTitle,
          gapAfterName,
          height: titleLineHeight + gapAfterTitle + measureTextBlockHeight(nameBlock) + gapAfterName + measureTextBlockHeight(reasonBlock)
        };
      },
      availableHeight,
      { minScale: 0.66, step: 0.04 }
    );
    let cursorY = getCenteredContentTop(rect.y, rect.h, layout.height, pad);

    ctx.save();
    drawRoundedRect(ctx, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, 30);
    ctx.clip();
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.fillStyle = withAlpha(accent, 0.92);
    ctx.font = isPortrait ? '700 20px Manrope, sans-serif' : '700 18px Manrope, sans-serif';
    ctx.fillText(cardTitle, rect.x + pad, cursorY);
    ctx.restore();
    cursorY += titleLineHeight + layout.gapAfterTitle;

    fillTextBlock(ctx, layout.nameBlock, rect.x + pad, cursorY, '#081120');
    cursorY += measureTextBlockHeight(layout.nameBlock) + layout.gapAfterName;

    fillTextBlock(ctx, layout.reasonBlock, rect.x + pad, cursorY, '#334155');
    ctx.restore();
  }

  function drawAxisPanel(ctx, rect, axisRows, isPortrait) {
    drawGlassPanel(ctx, rect.x, rect.y, rect.w, rect.h, {
      radius: 32,
      fill: 'rgba(255, 255, 255, 0.78)',
      stroke: 'rgba(255, 255, 255, 0.9)',
      shadowBlur: 18,
      shadowOffsetY: 14
    });

    const pad = isPortrait ? 28 : 30;
    const titleSize = isPortrait ? 19 : 18;
    const titleHeight = isPortrait ? 24 : 22;
    const titleGap = isPortrait ? 16 : 18;
    const contentTop = rect.y + pad + titleHeight + titleGap;
    const contentBottom = rect.y + rect.h - pad;

    ctx.save();
    ctx.fillStyle = '#4a6177';
    ctx.font = `700 ${titleSize}px Manrope, sans-serif`;
    ctx.fillText('Axis Details', rect.x + pad, rect.y + pad);
    ctx.restore();

    if (isPortrait) {
      const contentWidth = rect.w - pad * 2;
      const gap = 14;
      const cardHeight = (contentBottom - contentTop - gap * 2) / 3;
      axisRows.forEach((axis, index) => {
        drawAxisDetailCard(
          ctx,
          axis,
          {
            x: rect.x + pad,
            y: contentTop + index * (cardHeight + gap),
            w: contentWidth,
            h: cardHeight
          },
          true
        );
      });
      return;
    }

    const gap = 16;
    const cardWidth = (rect.w - pad * 2 - gap * 2) / 3;
    axisRows.forEach((axis, index) => {
      drawAxisDetailCard(
        ctx,
        axis,
        {
          x: rect.x + pad + index * (cardWidth + gap),
          y: contentTop,
          w: cardWidth,
          h: contentBottom - contentTop
        },
        false
      );
    });
  }

  function drawFooter(ctx, width, height, isPortrait) {
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = isPortrait ? '700 19px Manrope, sans-serif' : '700 17px Manrope, sans-serif';
    ctx.fillText('InvestoLab', 52, height - (isPortrait ? 28 : 22));
    const footer = 'investolab.github.io/InvestoLab';
    const footerWidth = ctx.measureText(footer).width;
    ctx.fillText(footer, width - 52 - footerWidth, height - (isPortrait ? 28 : 22));
    ctx.restore();
  }

  function renderSquareLayout(ctx, payload, axisRows, accent) {
    const pad = 48;
    const gap = 24;
    const leftWidth = 420;
    const rightWidth = 540;
    const topHeight = 628;
    const typeHeight = 344;
    const supportHeight = 260;
    const axisHeight = 332;

    drawTypeCard(ctx, { x: pad, y: pad, w: leftWidth, h: typeHeight }, payload, accent, getDominantAxis(axisRows), false);
    drawSupportCard(ctx, { x: pad, y: pad + typeHeight + gap, w: leftWidth, h: supportHeight }, payload, accent, false);
    drawNebulaWidget(ctx, { x: pad + leftWidth + gap, y: pad, w: rightWidth, h: topHeight }, axisRows, accent, false);
    drawAxisPanel(ctx, { x: pad, y: pad + topHeight + gap, w: 1080 - pad * 2, h: axisHeight }, axisRows, false);
    drawFooter(ctx, 1080, 1080, false);
  }

  function renderPortraitLayout(ctx, payload, axisRows, accent) {
    const pad = 48;
    const gap = 28;
    const cardWidth = 1080 - pad * 2;
    const typeHeight = 350;
    const nebulaHeight = 708;
    const axisHeight = 648;
    const supportHeight = 242;

    drawTypeCard(ctx, { x: pad, y: pad, w: cardWidth, h: typeHeight }, payload, accent, getDominantAxis(axisRows), true);
    drawNebulaWidget(ctx, { x: pad, y: pad + typeHeight + gap, w: cardWidth, h: nebulaHeight }, axisRows, accent, true);
    drawAxisPanel(ctx, { x: pad, y: pad + typeHeight + gap + nebulaHeight + gap, w: cardWidth, h: axisHeight }, axisRows, true);
    drawSupportCard(
      ctx,
      { x: pad, y: pad + typeHeight + gap + nebulaHeight + gap + axisHeight + gap, w: cardWidth, h: supportHeight },
      payload,
      accent,
      true
    );
    drawFooter(ctx, 1080, 2160, true);
  }

  function buildShareCanvas(rawPayload, mode = 'square') {
    const payload = normalizePayload(rawPayload);
    const width = 1080;
    const height = mode === 'portrait' ? 2160 : 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to build share image.');

    const axisRows = getAxisRows(payload.axisScores).length
      ? getAxisRows(payload.axisScores)
      : getAxisRows({
          riskAggressive: 50,
          controlInternal: 50,
          reactivityEmotional: 50
        });
    const dominantAxis = getDominantAxis(axisRows);
    const accent = dominantAxis?.color || '#2563eb';
    const isPortrait = mode === 'portrait';

    drawBackdrop(ctx, width, height, accent, isPortrait);
    if (isPortrait) renderPortraitLayout(ctx, payload, axisRows, accent);
    else renderSquareLayout(ctx, payload, axisRows, accent);

    return canvas;
  }

  function closePreview() {
    if (!modalState.backdrop) return;
    modalState.backdrop.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  function ensurePreviewModal() {
    if (modalState.backdrop) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'share-preview-backdrop hidden';
    backdrop.innerHTML = `
      <div class="share-preview-modal" role="dialog" aria-modal="true" aria-label="Share image preview">
        <div class="share-preview-head">
          <h4>Preview Share Image</h4>
          <button type="button" class="ghost" data-share-close>Close</button>
        </div>
        <div class="share-preview-mode-row">
          <button type="button" class="ghost share-preview-mode-btn active" data-share-mode="square" aria-pressed="true">1:1</button>
          <button type="button" class="ghost share-preview-mode-btn" data-share-mode="portrait" aria-pressed="false">9:18</button>
        </div>
        <p class="share-preview-ratio" data-share-ratio>Aspect ratio: 1:1</p>
        <div class="share-preview-frame">
          <img alt="InvestoType share preview" data-share-preview-image />
        </div>
        <div class="share-preview-actions">
          <button type="button" class="ghost" data-share-cancel>Cancel</button>
          <button type="button" data-share-download>Download Image</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    modalState.backdrop = backdrop;
    modalState.image = backdrop.querySelector('[data-share-preview-image]');
    modalState.ratioLabel = backdrop.querySelector('[data-share-ratio]');
    modalState.downloadBtn = backdrop.querySelector('[data-share-download]');

    backdrop.querySelector('[data-share-close]')?.addEventListener('click', closePreview);
    backdrop.querySelector('[data-share-cancel]')?.addEventListener('click', closePreview);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closePreview();
    });
    modalState.downloadBtn?.addEventListener('click', () => {
      if (!modalState.dataUrl) return;
      const link = document.createElement('a');
      link.download = modalState.fileName || 'investolab-investotype-result.png';
      link.href = modalState.dataUrl;
      link.click();
    });
    backdrop.querySelectorAll('[data-share-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = asText(button.getAttribute('data-share-mode')) || 'square';
        renderPreview(mode);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modalState.backdrop && !modalState.backdrop.classList.contains('hidden')) {
        closePreview();
      }
    });
  }

  function renderPreview(mode = 'square') {
    if (!modalState.backdrop || !modalState.payload) return;
    modalState.mode = mode === 'portrait' ? 'portrait' : 'square';

    modalState.backdrop.querySelectorAll('[data-share-mode]').forEach((button) => {
      const active = asText(button.getAttribute('data-share-mode')) === modalState.mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const canvas = buildShareCanvas(modalState.payload, modalState.mode);
    const suffix = modalState.mode === 'portrait' ? '9x18' : '1x1';
    modalState.dataUrl = canvas.toDataURL('image/png');
    modalState.fileName = `${modalState.payload.fileBase || 'investolab-investotype-result'}-${suffix}.png`;
    if (modalState.image) modalState.image.src = modalState.dataUrl;
    if (modalState.ratioLabel) {
      modalState.ratioLabel.textContent = modalState.mode === 'portrait' ? 'Aspect ratio: 9:18' : 'Aspect ratio: 1:1';
    }
    if (modalState.downloadBtn) {
      modalState.downloadBtn.textContent = modalState.mode === 'portrait' ? 'Download 9:18 Image' : 'Download 1:1 Image';
    }
  }

  function openPreview(payload, mode = 'square') {
    ensurePreviewModal();
    modalState.payload = normalizePayload(payload);
    renderPreview(mode);
    modalState.backdrop?.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  async function copyLink(link) {
    const target = asText(link) || global.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(target);
        return true;
      }
      throw new Error('Clipboard API unavailable');
    } catch (_error) {
      global.prompt('Copy this link:', target);
      return false;
    }
  }

  function attach(config = {}) {
    const trigger = resolveElement(config.trigger);
    const menu = resolveElement(config.menu);
    const copyLinkBtn = resolveElement(config.copyLinkBtn);
    const imageBtn = resolveElement(config.imageBtn);
    const getPayload = typeof config.getPayload === 'function' ? config.getPayload : () => config.payload;
    const onError =
      typeof config.onError === 'function'
        ? config.onError
        : (message) => {
            global.alert(message);
          };

    if (!trigger || !menu || !copyLinkBtn || !imageBtn) return null;

    let copyResetTimer = null;
    const copyDefaultLabel = copyLinkBtn.textContent;

    function hideMenu() {
      menu.classList.add('hidden');
    }

    function readPayload() {
      const payload = normalizePayload(getPayload?.());
      if (!payload.title) throw new Error('Generate a result first to share it.');
      return payload;
    }

    async function handleCopyLink() {
      try {
        const payload = readPayload();
        await copyLink(payload.link);
        if (copyResetTimer) clearTimeout(copyResetTimer);
        copyLinkBtn.textContent = 'Copied Link';
        copyResetTimer = global.setTimeout(() => {
          copyLinkBtn.textContent = copyDefaultLabel;
        }, 1400);
      } catch (error) {
        onError(asText(error?.message) || 'Unable to share this result yet.');
      } finally {
        hideMenu();
      }
    }

    function handleShareImage() {
      try {
        openPreview(readPayload(), 'square');
      } catch (error) {
        onError(asText(error?.message) || 'Unable to build a share image right now.');
      } finally {
        hideMenu();
      }
    }

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      menu.classList.toggle('hidden');
    });
    copyLinkBtn.addEventListener('click', (event) => {
      event.preventDefault();
      handleCopyLink().catch(() => {});
    });
    imageBtn.addEventListener('click', (event) => {
      event.preventDefault();
      handleShareImage();
    });
    menu.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menu.contains(target) || trigger.contains(target)) return;
      hideMenu();
    });

    return {
      hideMenu,
      openPreview: () => handleShareImage()
    };
  }

  global.InvestoTypeShare = {
    attach,
    buildShareCanvas
  };
})(window);
