"use strict";

import * as fs from "fs";

export default getTargetArch;

type ArchitectureName =
  | "UNKNOWN"
  | "AM33"
  | "AMD64"
  | "ARM"
  | "ARM64"
  | "ARMNT"
  | "EBC"
  | "I386"
  | "IA64"
  | "M32R"
  | "MIPS16"
  | "MIPSFPU"
  | "MIPSFPU16"
  | "POWERPC"
  | "POWERPCFP"
  | "R4000"
  | "RISCV32"
  | "RISCV64"
  | "RISCV128"
  | "SH3"
  | "SH3DSP"
  | "SH4"
  | "SH5"
  | "THUMB"
  | "WCEMIPSV2";

type ArchitectureCallback = (
  err: Error | null,
  archName?: ArchitectureName | null,
  archCode?: number
) => void;

// DWORD for offset of PE signature; see
// https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#ms-dos-stub-image-only
const SIGNATURE_OFFSET_OFFSET = 0x3c;

function getTargetArch(path: string, callback: ArchitectureCallback): void {
  fs.open(path, "r", function (err, fd) {
    if (err) return callback(err);
    readMagic(fd, function (err, archName, archCode) {
      fs.close(fd, (closeErr) => {
        if (closeErr ?? err) return callback(closeErr ?? err);
        else callback(null, archName, archCode);
      });
    });
  });
}

function readMagic(fd: number, callback: ArchitectureCallback): void {
  const buffer = Buffer.alloc(4);
  fs.read(fd, buffer, 0, 2, 0, function (err, bytesRead) {
    if (err) return callback(err);
    if (bytesRead !== 2) return callback(new Error("failed to read MZ magic"));
    const magic = buffer.readInt16BE();
    let bigEndian = null;
    if (magic === 0x5a4d) bigEndian = true;
    else if (magic === 0x4d5a) bigEndian = false;
    else return callback(new Error("not a DOS-MZ file"));
    readTargetArch(fd, bigEndian, callback);
  });
}

function readTargetArch(
  fd: number,
  bigEndian: boolean,
  callback: ArchitectureCallback
): void {
  const buffer = Buffer.alloc(4);
  fs.read(fd, buffer, 0, 4, SIGNATURE_OFFSET_OFFSET, function (err, bytesRead) {
    if (err) return callback(err);
    if (bytesRead !== 4)
      return callback(new Error("failed to read PE signature offset"));
    const signatureOffset = bigEndian
      ? buffer.readUInt32BE()
      : buffer.readUInt32LE();
    const targetArchOffset = signatureOffset + 4;
    fs.read(fd, buffer, 0, 2, targetArchOffset, function (err, bytesRead) {
      if (err) return callback(err);
      if (bytesRead !== 2)
        return callback(new Error("failed to read PE architecture field"));
      const targetArchCode = bigEndian
        ? buffer.readUInt16BE()
        : buffer.readUInt16LE();
      const targetArchName = architectureNameByCode(targetArchCode);
      callback(null, targetArchName, targetArchCode);
    });
  });
}

// see https://docs.microsoft.com/en-us/windows/win32/debug/pe-format#machine-types
function architectureNameByCode(code: number): ArchitectureName | null {
  switch (code) {
    case 0x0:
      return "UNKNOWN";
    case 0x1d3:
      return "AM33";
    case 0x8664:
      return "AMD64";
    case 0x1c0:
      return "ARM";
    case 0xaa64:
      return "ARM64";
    case 0x1c4:
      return "ARMNT";
    case 0xebc:
      return "EBC";
    case 0x14c:
      return "I386";
    case 0x200:
      return "IA64";
    case 0x9041:
      return "M32R";
    case 0x266:
      return "MIPS16";
    case 0x366:
      return "MIPSFPU";
    case 0x466:
      return "MIPSFPU16";
    case 0x1f0:
      return "POWERPC";
    case 0x1f1:
      return "POWERPCFP";
    case 0x166:
      return "R4000";
    case 0x5032:
      return "RISCV32";
    case 0x5064:
      return "RISCV64";
    case 0x5128:
      return "RISCV128";
    case 0x1a2:
      return "SH3";
    case 0x1a3:
      return "SH3DSP";
    case 0x1a6:
      return "SH4";
    case 0x1a8:
      return "SH5";
    case 0x1c2:
      return "THUMB";
    case 0x169:
      return "WCEMIPSV2";
    default:
      return null;
  }
}
