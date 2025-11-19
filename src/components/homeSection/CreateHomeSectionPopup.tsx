'use client'
import { HomeSection } from '../../lib/types';
import { createHomeSection } from '../../lib/features/homeSection/homeSectionsSlice';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { useState } from 'react';

export default function CreateHomeSectionPopup(){
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);
  const [numberOfParagraphs, setNumberOfParagraphs] = useState(1);

  function handleCreateHomeSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let formData = new FormData(event.currentTarget);
    let paragraphs = [];
    for (let i = 1; i <= numberOfParagraphs; i++) {
      paragraphs.push(formData.get(`paragraph${i}`));
      formData.delete(`paragraph${i}`);
    }
    formData.append('paragraphs', JSON.stringify(paragraphs));
    console.log('formData', formData);
    dispatch(createHomeSection({homeSection: formData, token}));
    event.currentTarget.reset();
  }

  return (
    <form encType='multipart/form-data' onSubmit= {handleCreateHomeSection} >
      <label htmlFor='title'>Title</label>
      <input type='text' id='title' name='title'/>
      <label htmlFor="order">Order</label>
      <input type="number" id="order" name="order"/>
      <label htmlFor='image'>Image</label>
      <input type='file' id='image' name='image' accept='image/*' />
      {Array.from({length: numberOfParagraphs}).map((_, index) => {
        return (
          <div key={index}>
            <label htmlFor={`paragraph${index + 1}`}>Paragraph {index + 1}</label>
            <textarea id={`paragraph${index + 1}`} name={`paragraph${index + 1}`}></textarea>
          </div>
        )
      })}
      <button type='button' onClick={() => setNumberOfParagraphs(numberOfParagraphs + 1)}>Add Paragraph</button>
      <button type='button' onClick={() => setNumberOfParagraphs(numberOfParagraphs - 1)}>Remove Paragraph</button>
      <button type='submit'>Create Home Section</button>
    </form>
  )
}