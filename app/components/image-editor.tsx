'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function ImageEditor() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [gradientColor, setGradientColor] = useState('#000000')
  const [opacity, setOpacity] = useState(50)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile()
            const img = new Image()
            img.onload = () => {
              setImage(img)
            }
            img.src = URL.createObjectURL(blob as Blob)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0)
        
        const gradient = ctx.createLinearGradient(0, image.height, 0, 0)
        gradient.addColorStop(0, `${gradientColor}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, `${gradientColor}00`)
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, image.width, image.height)
      }
    }
  }, [image, gradientColor, opacity])

  const handleCopy = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
        }
      })
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">图像编辑器</h1>
        <p>粘贴一张图片来开始编辑</p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <div>
          <Label htmlFor="gradient-color">渐变颜色</Label>
          <Input
            id="gradient-color"
            type="color"
            value={gradientColor}
            onChange={(e) => setGradientColor(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="opacity">不透明度</Label>
          <Slider
            id="opacity"
            min={0}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={(value) => setOpacity(value[0])}
          />
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
      
      <Button onClick={handleCopy} disabled={!image}>
        复制到剪贴板
      </Button>
    </div>
  )
}

