/**
 * ギャラリーに公開画像が 0 件のときの空状態。
 * 「エラー」「データなし」等の機械的表現は使わず、世界観に沿った短い文にする。
 * ダミー画像・仮 SVG・壊れた画像枠は出さない。
 */
export default function GalleryEmptyState() {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl border border-dashed border-babyblue-300 bg-white/60 px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-babyblue-100"
      >
        <span className="inline-block size-4 rounded-full bg-babyblue-400" />
      </span>
      <p className="mt-5 leading-loose text-night-800/90">
        すぴたろうたちの思い出を、
        <br />
        すこしずつ集めています。
      </p>
      <p className="mt-3 text-sm leading-relaxed text-night-800/70">
        イラストは準備ができ次第、ここに追加されます。
      </p>
    </div>
  );
}
