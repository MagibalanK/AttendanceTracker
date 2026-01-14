import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const HF_TOKEN = Deno.env.get("HF_TOKEN");
    if (!HF_TOKEN) {
      return new Response(
        JSON.stringify({ error: "HF_TOKEN missing" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const imageBuffer = await req.arrayBuffer();
    console.log("🖼 Image size:", imageBuffer.byteLength);

    // ✅ FIX: wrap image in FormData
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([imageBuffer], { type: "image/jpeg" }),
      "image.jpg"
    );

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
        },
        body: formData,
      }
    );

    const raw = await hfRes.text();
    console.log("🤗 HF status:", hfRes.status);
    console.log("🤗 HF raw response:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid HF response", raw }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Edge crashed", details: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
