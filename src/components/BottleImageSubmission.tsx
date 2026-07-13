"use client";

import { useState } from "react";

interface BottleImageSubmissionProps {
  oilSlug: string;
  oilName: string;
  producerSlug: string;
  producerName?: string;
  country: string;
  awardYears: string;
  currentImage: string;
  usesTemporaryBottle: boolean;
  sourcePage: string;
}

export default function BottleImageSubmission({
  oilSlug,
  oilName,
  producerSlug,
  producerName,
  country,
  awardYears,
  currentImage,
  usesTemporaryBottle,
  sourcePage,
}: BottleImageSubmissionProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const maxImageSize = 5 * 1024 * 1024;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? "");
    if (file && file.size > maxImageSize) {
      setError("Image must be 5 MB or less.");
      event.target.value = "";
      setFileName("");
      return;
    }
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSending(true);

    try {
      const form = event.currentTarget;
      const response = await fetch("/api/bottle-image-submissions", {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Could not send image.");
      }

      form.reset();
      setFileName("");
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send image.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSubmitted(false);
          setError("");
          setOpen(true);
        }}
        className="mx-auto mt-3 block text-sm font-semibold text-olive-950 underline underline-offset-4 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-gold-400/40"
      >
        Wrong or missing image? share correct image
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-olive-950/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bottle-submission-title"
        >
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-lg border border-olive-200 bg-[#fbf8ef] shadow-[0_26px_70px_rgba(0,0,0,0.28)]">
            <div className="border-b border-olive-200 px-5 py-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2
                    id="bottle-submission-title"
                    className="font-serif text-2xl font-bold leading-tight text-olive-950"
                  >
                    Official image
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-olive-700">
                    {oilName}
                    {producerName ? ` by ${producerName}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-olive-200 bg-white px-3 py-1 text-sm font-bold text-olive-900 transition hover:border-olive-900"
                  aria-label="Close submission form"
                >
                  X
                </button>
              </div>
            </div>

            {submitted ? (
              <div className="px-5 py-6">
                <div className="rounded-lg border border-olive-200 bg-white p-5">
                  <h3 className="font-serif text-xl font-bold text-olive-950">
                    Thank you.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-olive-700">
                    Your image was sent for review before publishing.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-5 rounded-sm bg-olive-950 px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-cream"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
                <input type="hidden" name="status" value="New" />
                <input type="hidden" name="oilSlug" value={oilSlug} />
                <input type="hidden" name="oilName" value={oilName} />
                <input type="hidden" name="producerSlug" value={producerSlug} />
                <input type="hidden" name="producerName" value={producerName ?? ""} />
                <input type="hidden" name="country" value={country} />
                <input type="hidden" name="awardYears" value={awardYears} />
                <input type="hidden" name="currentImage" value={currentImage} />
                <input
                  type="hidden"
                  name="usesTemporaryBottle"
                  value={usesTemporaryBottle ? "Yes" : "No"}
                />
                <input type="hidden" name="sourcePage" value={sourcePage} />

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-olive-500">
                    Email
                  </span>
                  <input
                    name="contactEmail"
                    type="email"
                    placeholder="name@company.com"
                    required
                    className="mt-1 w-full rounded-sm border border-olive-200 bg-white px-3 py-2 text-sm text-olive-950 outline-none transition focus:border-gold-500"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-olive-500">
                    Image
                  </span>
                  <input
                    name="primaryBottleImage"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    required
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-olive-800 file:mr-4 file:rounded-sm file:border-0 file:bg-olive-950 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.12em] file:text-cream"
                  />
                  {fileName && (
                    <span className="mt-2 block truncate text-xs text-olive-500">
                      {fileName}
                    </span>
                  )}
                  <span className="mt-2 block text-xs text-olive-500">
                    Maximum size: 5 MB.
                  </span>
                  <span className="mt-1 block text-xs text-olive-500">
                    Please upload transparent background image if possible.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-sm border border-olive-200 bg-white p-3 text-sm text-olive-700">
                  <input
                    name="permissionConfirmed"
                    type="checkbox"
                    required
                    className="mt-1"
                  />
                  <span>
                    I confirm I have the right to share this image with
                    TerraOlivo.
                  </span>
                </label>

                {error && (
                  <p className="rounded-sm border border-terracotta-400 bg-white px-3 py-2 text-sm font-semibold text-terracotta-500">
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-olive-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-sm border border-olive-300 px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-olive-800 transition hover:border-olive-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="rounded-sm bg-gold-500 px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-olive-950 transition hover:bg-gold-400"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
