import cv2, numpy as np, subprocess, sys, math
src, out = sys.argv[1], sys.argv[2]
FPS, DUR = 30, 8.0
N = int(sys.argv[3]) if len(sys.argv)>3 else int(FPS * DUR)
OW, OH = 1080, 1920
SS = 2  # supersample factor for warps/camera

base = cv2.imread(src)                      # 941x1672
H0, W0 = base.shape[:2]

# ---------- helicopter: extract sprite, inpaint background ----------
hx0, hy0, hx1, hy1 = 166, 248, 236, 294
crop = base[hy0:hy1, hx0:hx1].astype(np.int16)
hmask = ((crop[..., 2] < 185) | (crop[..., 0] - crop[..., 2] > 40)).astype(np.uint8)
hmask = cv2.morphologyEx(hmask, cv2.MORPH_CLOSE, np.ones((2, 2), np.uint8))
full = np.zeros((H0, W0), np.uint8); full[hy0:hy1, hx0:hx1] = hmask * 255
full = cv2.dilate(full, np.ones((5, 5), np.uint8))
base = cv2.inpaint(base, full, 5, cv2.INPAINT_TELEA)
sprite = crop.astype(np.uint8).copy()
salpha = cv2.GaussianBlur(hmask.astype(np.float32), (3, 3), 0.6)
# remove original rotor blades (thin rows above body) except the mast
ry0, ry1 = 252 - hy0, 265 - hy0
salpha[ry0:ry1, :] = 0
salpha[ry0 + 6:ry1, 196 - hx0:203 - hx0] = hmask[ry0 + 6:ry1, 196 - hx0:203 - hx0]
hub = (200 - hx0, 258 - hy0)

# ---------- upscale working canvas ----------
W, H = W0 * SS, H0 * SS
img = cv2.resize(base, (W, H), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
X, Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))

def gauss(cx, cy, sx, sy=None):
    sy = sy or sx
    return np.exp(-(((X - cx * SS) / (sx * SS)) ** 2 + ((Y - cy * SS) / (sy * SS)) ** 2) / 2).astype(np.float32)

def rect_mask(x0, y0, x1, y1, feather):
    m = np.zeros((H, W), np.float32)
    m[int(y0 * SS):int(y1 * SS), int(x0 * SS):int(x1 * SS)] = 1
    k = int(feather * SS) | 1
    return cv2.GaussianBlur(m, (k, k), 0)

# palm sway regions (window areas), exclude Pamela head & sign
not_head = 1 - np.clip(gauss(345, 375, 95, 115) * 3, 0, 1)
palmL = rect_mask(0, 110, 245, 410, 31) * np.clip((410 - Y / SS) / 200, 0, 1)
palmM = rect_mask(400, 240, 500, 430, 25) * np.clip((430 - Y / SS) / 160, 0, 1) * not_head
palmR = rect_mask(858, 270, 941, 520, 21) * np.clip((520 - Y / SS) / 220, 0, 1)

# character motion bumps (static kernels)
g_handR = gauss(615, 545, 38, 34)     # upper glove
g_handL = gauss(470, 615, 42, 36)     # lower glove
g_pamHead = gauss(345, 380, 80, 95)
g_pamBody = gauss(300, 640, 150, 170)
g_cliHead = gauss(585, 690, 80, 95)
g_cliBody = gauss(640, 900, 200, 150)
g_cliHands = gauss(770, 860, 80, 50)
g_green = gauss(75, 580, 55, 70)
g_suit = gauss(800, 600, 70, 80)
sign_keep = 1 - rect_mask(640, 160, 862, 520, 15)   # sign never warps

# lights
bulbs = [(382, 190), (420, 175), (462, 152), (507, 128), (556, 103)]
# mirror frame highlight mask
hsv = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2HSV)
mir = ((hsv[..., 2] > 200) & (hsv[..., 1] < 120)).astype(np.float32)
mir *= np.maximum(rect_mask(480, 240, 650, 1300, 5), rect_mask(830, 150, 941, 1300, 5))
mir = cv2.GaussianBlur(mir, (5, 5), 0)

# blinks: (eye ellipses in orig coords), blink times (s)
eyes_green = [((80, 564), (10, 4)), ((115, 577), (6, 3))]
eyes_suit = [((800, 586), (10, 4))]
blink_green, blink_suit, blink_client = [1.6, 5.9], [3.1, 6.8], [2.4, 6.2]
eyes_client = [((600, 668), (14, 4)), ((655, 676), (11, 3))]

def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)

def blink_amount(t, times):
    a = 0.0
    for b in times:
        d = abs(t - b)
        if d < 0.09: a = max(a, 1 - d / 0.09)
    return a

def draw_blink(frame, eyes, amt):
    if amt <= 0: return
    for (cx, cy), (ax, ay) in eyes:
        cx2, cy2, ax2, ay2 = cx * SS, cy * SS, ax * SS, ay * SS
        skin = frame[int(cy2 - ay2 * 3.2):int(cy2 - ay2 * 2.2), int(cx2 - ax2 * .6):int(cx2 + ax2 * .6)].reshape(-1, 3)
        col = np.median(skin, axis=0)
        m = np.zeros(frame.shape[:2], np.float32)
        cv2.ellipse(m, (int(cx2), int(cy2)), (int(ax2 * 1.15), int(ay2 * 1.4 * amt) + 1), 0, 0, 360, 1, -1)
        m = cv2.GaussianBlur(m, (5, 5), 0)[..., None]
        frame[:] = frame * (1 - m) + col * m
        if amt > 0.6:
            cv2.ellipse(frame, (int(cx2), int(cy2 + ay2 * 0.3)), (int(ax2 * 1.05), int(ay2 * 0.5)), 0, 10, 170, (40, 30, 30), max(1, SS))

proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
rng = np.random.default_rng(7)
for i in range(N):
    t = i / FPS
    w = 2 * math.pi
    dx = np.zeros((H, W), np.float32); dy = np.zeros((H, W), np.float32)
    # palms: gusty sway, phase varies with height
    gust = 1 + 0.35 * math.sin(w * t / 5.3)
    for m, A, f, ph in ((palmL, 3.2, 0.42, 0), (palmM, 2.4, 0.5, 1.3), (palmR, 2.6, 0.45, 2.1)):
        dx += m * (A * SS * gust) * np.sin(w * f * t + ph + Y / (SS * 60.0))
        dy += m * (0.6 * SS) * np.sin(w * f * 1.7 * t + ph)
    # Pamela hands working on the hair system (small circular motions)
    dx += g_handR * (2.6 * SS * math.sin(w * t / 1.4))
    dy += g_handR * (1.8 * SS * math.sin(w * t / 1.4 + 1.2))
    dx += g_handL * (2.4 * SS * math.sin(w * t / 1.7 + 2.0))
    dy += g_handL * (1.6 * SS * math.cos(w * t / 1.7 + 0.5))
    dy += g_pamHead * (1.4 * SS * math.sin(w * t / 2.6)); dx += g_pamHead * (0.8 * SS * math.sin(w * t / 3.9))
    dy += g_pamBody * (1.2 * SS * math.sin(w * t / 4.0))
    # clients: breathing and subtle head moves
    dy += g_cliBody * (1.5 * SS * math.sin(w * t / 4.4 + 1))
    dx += g_cliHead * (1.2 * SS * math.sin(w * t / 5.0)); dy += g_cliHead * (0.8 * SS * math.sin(w * t / 3.3))
    dy += g_cliHands * (1.0 * SS * math.sin(w * t / 3.0 + .7))
    dx += g_green * (1.3 * SS * math.sin(w * t / 6.0 + 2)); dy += g_green * (0.6 * SS * math.sin(w * t / 4.1))
    dx += g_suit * (1.1 * SS * math.sin(w * t / 5.5 + 1)); dy += g_suit * (0.7 * SS * math.sin(w * t / 4.6 + 2))
    dx *= sign_keep; dy *= sign_keep
    fr = cv2.remap(img, X - dx, Y - dy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

    # helicopter: slow flight + bob, rotor
    px = hx0 + 30 * ease(t / DUR) - 4; py = hy0 + 1.5 * math.sin(w * t / 2.2)
    sw, sh = sprite.shape[1] * SS, sprite.shape[0] * SS
    spr = cv2.resize(sprite, (sw, sh), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    al = cv2.resize(salpha, (sw, sh), interpolation=cv2.INTER_LINEAR)
    # rotor disc (motion blur) + blade
    rot = np.zeros((sh, sw), np.float32)
    hc = (int(hub[0] * SS), int(hub[1] * SS))
    cv2.ellipse(rot, hc, (31 * SS, 2 * SS), 0, 0, 360, 0.28, -1)
    ang = w * 7.3 * t
    for k in range(4):
        a = ang + k * math.pi / 2
        L = 31 * SS * abs(math.cos(a))
        ex = int(hc[0] + L * (1 if math.cos(a) > 0 else -1)); ey = int(hc[1] + 2 * SS * math.sin(a))
        cv2.line(rot, hc, (ex, ey), 0.75, SS)
    rot = cv2.GaussianBlur(rot, (3, 3), 0)
    tail = (int((222 - hx0) * SS), int((270 - hy0) * SS))
    cv2.circle(rot, tail, int((3 + 2 * abs(math.sin(ang * 1.7))) * SS), 0.35, -1)
    al2 = np.clip(al + rot, 0, 1)
    spr = spr * (al[..., None] > 0) + np.array([90, 50, 60], np.float32) * (al[..., None] <= 0)
    x0, y0 = int(px * SS), int(py * SS)
    roi = fr[y0:y0 + sh, x0:x0 + sw]
    roi[:] = roi * (1 - al2[..., None]) + spr * al2[..., None]

    # blinks
    draw_blink(fr, eyes_green, blink_amount(t, blink_green))
    draw_blink(fr, eyes_suit, blink_amount(t, blink_suit))
    draw_blink(fr, eyes_client, blink_amount(t, blink_client))

    # bulbs: glow pulse
    glow = np.zeros((H, W), np.float32)
    for j, (bx, by) in enumerate(bulbs):
        inten = 0.55 + 0.25 * math.sin(w * t * 0.9 + j * 1.1) + 0.06 * rng.standard_normal()
        cv2.circle(glow, (bx * SS, by * SS), 30 * SS, float(max(inten, 0)), -1)
    glow = cv2.GaussianBlur(glow, (0, 0), 22 * SS)
    fr += glow[..., None] * np.array([60, 140, 200], np.float32)
    # mirror light sweep
    band = np.exp(-(((X + Y * 0.5) / SS - (-200 + 1900 * (t / DUR))) / 90.0) ** 2).astype(np.float32)
    fr += (mir * band)[..., None] * 70

    # camera: slow push-in toward the action
    z = 1.0 + 0.075 * ease(t / DUR)
    cw, ch = W / z, H / z
    cx = W / 2 + (470 * SS - W / 2) * (1 - 1 / z) * 0.9
    cy = H / 2 + (720 * SS - H / 2) * (1 - 1 / z) * 0.9
    M = np.float32([[OW / cw, 0, -(cx - cw / 2) * OW / cw], [0, OH / ch, -(cy - ch / 2) * OH / ch]])
    o = cv2.warpAffine(np.clip(fr, 0, 255), M, (OW, OH), flags=cv2.INTER_AREA)
    o = o + rng.normal(0, 2.0, o.shape).astype(np.float32)   # film grain
    proc.stdin.write(np.clip(o, 0, 255).astype(np.uint8).tobytes())
    if i % 30 == 0: print('frame', i, flush=True)
proc.stdin.close(); proc.wait()
print('done')
