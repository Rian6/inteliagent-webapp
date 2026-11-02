import { useState } from "react";
import { Pressable, View, Text, ActivityIndicator } from "react-native-web";
import { createButton } from "@gluestack-ui/core/button/creator";
import { createAccordion } from "@gluestack-ui/core/accordion/creator";
import { design as d } from "../design";
const GSButton = createButton({
  Root: Pressable,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: View,
});
const GSAccordion = createAccordion({
  Root: View,
  Item: View,
  Header: View,
  Trigger: Pressable,
  Content: View,
  Icon: View,
  TitleText: Text,
  ContentText: Text,
});
export function ActionButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  startIcon,
  ariaLabel,
  style,
}) {
  return (
    <GSButton
      accessibilityLabel={ariaLabel}
      isDisabled={disabled}
      onPress={onClick}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor:
          variant === "primary"
            ? d.primary
            : variant === "subtle"
              ? d.tint
              : "transparent",
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor: d.border,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      })}
    >
      {startIcon && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            color: variant === "primary" ? "white" : d.primary,
          }}
        >
          {startIcon}
        </span>
      )}
      <GSButton.Text
        style={{
          fontFamily: "Inter,system-ui,sans-serif",
          fontSize: 14,
          fontWeight: "600",
          lineHeight: 22,
          color: variant === "primary" ? "white" : d.primary,
          textAlign: "center",
        }}
      >
        {children}
      </GSButton.Text>
    </GSButton>
  );
}
export function Disclosure({
  title,
  summary,
  children,
  initiallyOpen = false,
}) {
  const [keys, setKeys] = useState(initiallyOpen ? ["details"] : []),
    open = keys.includes("details");
  return (
    <GSAccordion
      type="single"
      value={keys}
      onValueChange={setKeys}
      isCollapsible
      style={{ minWidth: 0, width: "100%" }}
    >
      <GSAccordion.Item
        value="details"
        style={{ minWidth: 0, borderTopWidth: 1, borderColor: d.border }}
      >
        <GSAccordion.Header>
          <GSAccordion.Trigger
            accessibilityLabel={title}
            style={{
              minHeight: 52,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <GSAccordion.TitleText
                style={{
                  fontFamily: "Inter,system-ui,sans-serif",
                  fontSize: 14,
                  fontWeight: "600",
                  color: d.ink,
                  lineHeight: 22,
                }}
              >
                {title}
              </GSAccordion.TitleText>
              {!open && summary && (
                <Text
                  style={{
                    fontFamily: "Inter,system-ui,sans-serif",
                    fontSize: 12,
                    color: d.muted,
                    lineHeight: 18,
                  }}
                >
                  {summary}
                </Text>
              )}
            </View>
            <Text style={{ color: d.muted, fontSize: 20 }}>
              {open ? "−" : "+"}
            </Text>
          </GSAccordion.Trigger>
        </GSAccordion.Header>
        <GSAccordion.Content
          style={{
            display: open ? "flex" : "none",
            paddingBottom: 16,
            minWidth: 0,
          }}
        >
          {open ? children : null}
        </GSAccordion.Content>
      </GSAccordion.Item>
    </GSAccordion>
  );
}
