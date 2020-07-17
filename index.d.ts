export = getTargetArch;
declare type ArchitectureName = "UNKNOWN" | "AM33" | "AMD64" | "ARM" | "ARM64" | "ARMNT" | "EBC" | "I386" | "IA64" | "M32R" | "MIPS16" | "MIPSFPU" | "MIPSFPU16" | "POWERPC" | "POWERPCFP" | "R4000" | "RISCV32" | "RISCV64" | "RISCV128" | "SH3" | "SH3DSP" | "SH4" | "SH5" | "THUMB" | "WCEMIPSV2";
declare type ArchitectureCallback = (err: Error | null, archName?: ArchitectureName | null, archCode?: number) => void;
declare function getTargetArch(path: string, callback: ArchitectureCallback): void;
