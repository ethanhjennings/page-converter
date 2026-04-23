import { useState, useEffect, type ComponentProps } from 'react'
import './App.css'

import {
  Field,
  FieldGroup,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { ThemeProvider } from './components/theme-provider'

type PageRanges = {
  book1PageStart: string
  book1PageEnd: string
  book2PageStart: string
  book2PageEnd: string
}

type PageRangeField = keyof PageRanges

const parsePage = (value: string) => {
  if (value.trim() === '') {
    return null
  }

  const page = Number(value)
  return Number.isFinite(page) ? page : null
}

const convertPage = (
  page: string,
  sourceStart: string,
  sourceEnd: string,
  targetStart: string,
  targetEnd: string,
) => {
  const parsedPage = parsePage(page)
  const parsedSourceStart = parsePage(sourceStart)
  const parsedSourceEnd = parsePage(sourceEnd)
  const parsedTargetStart = parsePage(targetStart)
  const parsedTargetEnd = parsePage(targetEnd)

  if (
    parsedPage === null ||
    parsedSourceStart === null ||
    parsedSourceEnd === null ||
    parsedTargetStart === null ||
    parsedTargetEnd === null ||
    parsedSourceEnd === parsedSourceStart
  ) {
    return ''
  }

  const pageOffset = parsedPage - parsedSourceStart
  const sourceRange = parsedSourceEnd - parsedSourceStart
  const targetRange = parsedTargetEnd - parsedTargetStart
  const convertedPage = Math.round((pageOffset / sourceRange) * targetRange) + parsedTargetStart

  return convertedPage.toString()
}

function getLocalstorage(key: string, defaultValue: string): string {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
}

function PageInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      type="number"
      inputMode="numeric"
      className={["no-spinner", className].filter(Boolean).join(" ")}
    />);
}

function App() {
  const [book1PageStart, setBook1PageStart] = useState(getLocalstorage('book1PageStart', '0'));
  const [book1PageEnd, setBook1PageEnd] = useState(getLocalstorage('book1PageEnd', ''));
  const [book2PageStart, setBook2PageStart] = useState(getLocalstorage('book2PageStart', '0'));
  const [book2PageEnd, setBook2PageEnd] = useState(getLocalstorage('book2PageEnd', ''));
  const [currentPageBook1, setCurrentPageBook1] = useState('');
  const [currentPageBook2, setCurrentPageBook2] = useState('');

  const pageRanges = {
    book1PageStart,
    book1PageEnd,
    book2PageStart,
    book2PageEnd,
  }

  useEffect(() => {
    localStorage.setItem('book1PageStart', JSON.stringify(book1PageStart));
    localStorage.setItem('book1PageEnd', JSON.stringify(book1PageEnd));
    localStorage.setItem('book2PageStart', JSON.stringify(book2PageStart));
    localStorage.setItem('book2PageEnd', JSON.stringify(book2PageEnd));
  }, [book1PageStart, book1PageEnd, book2PageStart, book2PageEnd]);
  
  const calculateCurrentPageBook1 = (value: string, ranges: PageRanges) =>
    convertPage(
      value,
      ranges.book2PageStart,
      ranges.book2PageEnd,
      ranges.book1PageStart,
      ranges.book1PageEnd,
    )

  const calculateCurrentPageBook2 = (value: string, ranges: PageRanges) =>
    convertPage(
      value,
      ranges.book1PageStart,
      ranges.book1PageEnd,
      ranges.book2PageStart,
      ranges.book2PageEnd,
    )

  const recalculateCurrentPages = (ranges: PageRanges) => {
    if (currentPageBook1.trim() !== '') {
      setCurrentPageBook2(calculateCurrentPageBook2(currentPageBook1, ranges))
      return
    }

    if (currentPageBook2.trim() !== '') {
      setCurrentPageBook1(calculateCurrentPageBook1(currentPageBook2, ranges))
    }
  }

  const updatePageRange = (
    field: PageRangeField,
    value: string,
    setPageRange: (value: string) => void,
  ) => {
    const nextPageRanges = {
      ...pageRanges,
      [field]: value,
    }

    setPageRange(value)
    recalculateCurrentPages(nextPageRanges)
  }

  const updateCurrentPageBook1 = (value: string) => {
    setCurrentPageBook1(value);
    setCurrentPageBook2(calculateCurrentPageBook2(value, pageRanges));
  }

  const updateCurrentPageBook2 = (value: string) => {
    setCurrentPageBook2(value);
    setCurrentPageBook1(calculateCurrentPageBook1(value, pageRanges));
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <ModeToggle />
      </div>

      <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Book Page Converter</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Match page ranges between two editions in either direction.
        </p>
      </header>

      <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <FieldGroup>
          <FieldSet>
            <h2 className="text-lg font-semibold tracking-tight">Page ranges</h2>

            <div className="grid gap-4">
              <Field className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center">
                <FieldTitle>Book 1</FieldTitle>

                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <PageInput
                    id="book1PageStart"
                    aria-label="Book 1 start page"
                    value={book1PageStart}
                    onChange={(e) => {
                      updatePageRange('book1PageStart', e.target.value, setBook1PageStart);
                    }}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <PageInput
                    id="book1PageEnd"
                    aria-label="Book 1 end page"
                    placeholder=""
                    value={book1PageEnd}
                    onChange={(e) => {
                      updatePageRange('book1PageEnd', e.target.value, setBook1PageEnd);
                    }}
                  />
                </div>
              </Field>

              <Field className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center">
                <FieldTitle>Book 2</FieldTitle>

                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <PageInput
                    id="book2PageStart"
                    aria-label="Book 2 start page"
                    placeholder=""
                    value={book2PageStart}
                    onChange={(e) => {
                      updatePageRange('book2PageStart', e.target.value, setBook2PageStart);
                    }}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <PageInput
                    id="book2PageEnd"
                    aria-label="Book 2 end page"
                    placeholder=""
                    value={book2PageEnd}
                    onChange={(e) => {
                      updatePageRange('book2PageEnd', e.target.value, setBook2PageEnd);
                    }}
                  />
                </div>
              </Field>
            </div>
          </FieldSet>

          <FieldSet>
            <h2 className="text-lg font-semibold tracking-tight">Current page</h2>

            <div className="grid gap-4">
              <Field className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center">
                <FieldTitle>Book 1</FieldTitle>
                <PageInput
                  id="currentPageBook1"
                  aria-label="Current page in book 1"
                  placeholder="Page"
                  value={currentPageBook1}
                  onChange={(e) => {
                    updateCurrentPageBook1(e.target.value);
                  }}
                />
              </Field>

              <Field className="grid gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center">
                <FieldTitle>Book 2</FieldTitle>
                <PageInput
                  id="currentPageBook2"
                  aria-label="Current page in book 2"
                  placeholder="Page"
                  value={currentPageBook2}
                  onChange={(e) => {
                    updateCurrentPageBook2(e.target.value);
                  }}
                />
              </Field>
            </div>
          </FieldSet>
        </FieldGroup>
      </section>
    </main>
    </ThemeProvider>
  )
}

export default App
