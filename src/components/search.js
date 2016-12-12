'use strict'
import React        from 'react'

const options = [
    {value: 'name', text: 'a track name'}
  , {value: 'namesearch', text: 'search track by name'}
  , {value: 'artist_name', text: 'artist name'}
  , {value: 'album_name', text: 'album name'}
  , {value: 'tags', text: 'tag(AND)'}
  , {value: 'fuzzytags', text: 'tag(OR)'}
  , {value: 'search', text: 'a free text'}
]

const Search = (props) => {
    return (
            <form
                role="search"
                id="jamendo-search-track"
                onSubmit={ev => {
                    ev.preventDefault()
                    const $search = ev.target.querySelector('input[type="search"]')
                    props.helper('find', {
                        key: ev.target.querySelector('select').value
                      , val: $search.value.trim()
                    })
                    $search.value = ''
                }}
            >
                <div className="rows" style={{
                    alignItems: 'center'
                  , justifyContent: 'flex-end'
                }}>
                    <div>
                        <select>
                        {options.map(opt => {
                            return (
                                <option value={opt.value} key={opt.value}>
                                    {opt.text}
                                </option>
                            )
                        })}
                        </select>
                    </div>
                    <div style={{padding: '0 6px'}}>
                        <input
                            type="search"
                            required
                            placeholder="keyword"
                        />
                    </div>
                </div>
            </form>
    )
}

export default Search
