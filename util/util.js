/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
 export function humanFileSize(bytes, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    /*
    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    */
    // We only want up to GB's, to show growth!
    const units = si
      ? ['kB', 'MB', 'GB', 'TB']
      : ['KiB', 'MiB', 'GiB', 'TiB'];
    let u = -1;
    const r = 10 ** dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return numberWithCommas(parseFloat(bytes.toFixed(dp))) + ' ' + units[u];
  }
  
  function numberWithCommas(x) {
    if (typeof x === 'number') {
      return x.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return x;
    }
  }