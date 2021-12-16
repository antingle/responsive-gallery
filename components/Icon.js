import React from "react";

export default function Icon({ icon, ...props }) {
  return (
    <a className="ril__builtinButton  icon" {...props}>
      <i className={`fa ${icon} ril__toolbarItemChild`} />
    </a>
  );
}
