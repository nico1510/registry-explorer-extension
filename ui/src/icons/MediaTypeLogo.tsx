import helmIcon from "./helm-icon-color.svg";
import inTotoLogo from "./in-toto-logo.png";
import ociIcon from "./oci-icon-color.png";
import singularityIcon from "./singularity_v3.png";
import wasmLogo from "./WebAssembly_Logo.svg";

function getLogoForMediaType(media_type: string) {
  if (media_type.startsWith("application/vnd.cncf.helm")) {
    return helmIcon;
  }
  if (media_type.startsWith("application/vnd.sylabs.sif")) {
    return singularityIcon;
  }
  if (media_type.startsWith("application/vnd.in-toto")) {
    return inTotoLogo;
  }

  if (
    media_type.startsWith("application/vnd.wasm") ||
    media_type.startsWith("application/vnd.fermyon.spin")
  ) {
    return wasmLogo;
  }

  // default to OCI
  return ociIcon;
}

export const MediaTypeLogo = ({ mediaType }: { mediaType: string }) => {
  return (
    <img
      style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "20%" }}
      src={getLogoForMediaType(mediaType)}
      alt={`${mediaType} logo}`}
    />
  );
};
