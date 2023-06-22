import sha256 from "crypto-js/sha256";
import CryptoJS from "crypto-js"

export function numberToUniqueColor(number: number) {
    const string = number.toString()
    function byteToHex(byte: number) {
      const hex = byte.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }
    
    const hash = sha256(string);

    // Extract the first three bytes from the hash
    const red = hash.toString(CryptoJS.enc.Base64).charCodeAt(0);
    const green = hash.toString(CryptoJS.enc.Base64).charCodeAt(1);
    const blue = hash.toString(CryptoJS.enc.Base64).charCodeAt(2);

    // Convert RGB to hexadecimal format
    const color = "#" + byteToHex(red) + byteToHex(green) + byteToHex(blue);

    return color;
  }