import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {faEllipsis, faXmark} from "@fortawesome/free-solid-svg-icons";
import CustomSelect from "@/components/shared/forms/CustomSelect";
import globalMenuStyles from "./ActionMenu.module.css";

export default function ActionMenu({
    actions,
    selectConfig,
    primaryAction,
    onMenuOpen
}: ActionMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    const onActionClickHandler = (onClick: () => void) => {
        onClick();
        setMenuOpen(false);
    };

    const onMenuToggleHandler = () => {
        const isOpening = !menuOpen;
        setMenuOpen(isOpening);
        if (isOpening) {
            onMenuOpen?.();
        }
    };

    return (
        <div className={globalMenuStyles.mainContainerHor}>
            <div className={globalMenuStyles.menuAnchor}>
                <button
                    type={"button"}
                    className={globalMenuStyles.button}
                    onClick={onMenuToggleHandler}
                    aria-expanded={menuOpen}
                    data-testid={"action-menu-toggle"}
                >
                    <FontAwesomeIcon icon={menuOpen ? faXmark : faEllipsis}/>
                </button>
                {menuOpen ? (
                    <div className={globalMenuStyles.menuPopover}>
                        {actions.map((action) => (
                            <button
                                key={action.id}
                                type={"button"}
                                onClick={() => onActionClickHandler(action.onClick)}
                                className={globalMenuStyles.actionRow}
                            >
                                <span className={`${globalMenuStyles.button} ${globalMenuStyles.actionButton} ${globalMenuStyles.actionIconShell}`}>
                                    <FontAwesomeIcon icon={action.icon}/>
                                </span>
                                <span className={globalMenuStyles.actionLabel}>{action.label}</span>
                            </button>
                        ))}
                        {selectConfig ? (
                            <div className={`${globalMenuStyles.selectWrapper} ${globalMenuStyles.selectWrapperWithDivider}`}>
                                <CustomSelect
                                    onChange={selectConfig.onChange}
                                    defaultValue={selectConfig.defaultValue}
                                    options={selectConfig.options}
                                    direction={selectConfig.direction ?? "up"}
                                    style={{width: "100%", fontSize: "0.95rem", fontWeight: 700}}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
            <button
                type={"button"}
                className={globalMenuStyles.button}
                onClick={primaryAction.onClick}
                data-testid={"action-menu-primary"}
            >
                <FontAwesomeIcon icon={primaryAction.icon}/>
            </button>
        </div>
    );
}

export type ActionMenuItem = {
    id: string;
    label: string;
    icon: IconDefinition;
    onClick: () => void;
}

export type ActionMenuSelectConfig = {
    defaultValue: string;
    options: string[];
    onChange: (value: string) => void;
    direction?: "down" | "up" | "left" | "right";
}

export type ActionMenuPrimaryAction = {
    icon: IconDefinition;
    onClick: () => void;
}

export type ActionMenuProps = {
    actions: ActionMenuItem[];
    selectConfig?: ActionMenuSelectConfig;
    primaryAction: ActionMenuPrimaryAction;
    onMenuOpen?: () => void;
}
