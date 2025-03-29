import { api } from "@/utils/api";
import { Spin } from "antd";
import Link from "next/link";
import QRCode from "react-qr-code";

export function GeneralLinks() {
  const api_links_get = api.link.get.useQuery({});

  return (
    <section
      style={{
        padding: "40px 0", // Simple padding instead of py-12 etc.
        width: "100%",
        alignSelf: "flex-start",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <h2
          style={{ fontSize: "24px", fontWeight: "bold" }}
        >{`General Links ${api_links_get.isLoading ? "(Loading)" : ""}`}</h2>
        <p style={{ color: "#6c757d" }}>
          Here are the important links, please click the one you require
        </p>
        <Spin
          spinning={api_links_get.isLoading}
          style={{
            minHeight: "300px",
            width: "98vw",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {api_links_get.data?.map((item) => (
              <Link
                href={item.url}
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid #ccc",
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                  width: "100%",
                  maxWidth: 300,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: 120,
                      overflow: "hidden",
                      color: "#6c757d",
                    }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                      {item.label}
                    </h3>
                    <span
                      style={{
                        fontSize: "14px",
                        wordWrap: "normal",
                        overflowWrap: "break-word",
                      }}
                    >
                      {item.description ??
                        `Updated by ${item.user.wicf_member?.first_name}`}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 5,
                    }}
                  >
                    <QRCode value={item.url} size={80} />
                  </div>
                </div>
                <span style={{ fontSize: "14px", color: "#6c757d" }}>
                  {`Last updated: ${new Date(item.updated_at).toLocaleDateString()}`}
                </span>
              </Link>
            ))}
          </div>
        </Spin>
      </div>
    </section>
  );
}
